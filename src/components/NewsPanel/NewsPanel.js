import dataService from '../../service/dataService.js'
import pipeService from '../../service/pipeService.js';
import * as echarts from 'echarts';

export default {
    name: 'NewsPanel',
    components: {},
    props: {},
    computed: {
        // 提取所有分类选项
        categoryOptions() {
            return [...new Set(this.newsList.map(item => item.category))];
        },
        // 提取所有主题选项
        topicOptions() {
            return [...new Set(this.newsList.map(item => item.topic))];
        },
        // 过滤后的新闻列表
        filteredNewsList() {
            return this.newsList.filter(news => {
                // 分类筛选
                if (this.filterCategory && news.category !== this.filterCategory) {
                    return false;
                }
                // 主题筛选
                if (this.filterTopic && news.topic !== this.filterTopic) {
                    return false;
                }
                // 标题或实体搜索
                if (this.searchText) {
                    const searchLower = this.searchText.toLowerCase();
                    // 搜索标题
                    if (news.headline.toLowerCase().includes(searchLower)) {
                        return true;
                    }
                    // 搜索实体关键词
                    const entityKeys = Object.keys(news.titleEntity);
                    for (let key of entityKeys) {
                        if (key.toLowerCase().includes(searchLower)) {
                            return true;
                        }
                    }
                    return false;
                }
                return true;
            });
        },
        dateRange() {
            // 生成从7月4号到7月17号的日期数组
            const dates = [];
            for (let i = 4; i <= 17; i++) {
                dates.push(`2023-07-${i.toString().padStart(2, '0')}`);
            }
            return dates;
        },
        // 获取选中新闻的唯一分类
        selectedCategories() {
            return [...new Set(this.selectedNews.map(news => news.category))];
        }
    },
    data() {
        return {
            newsList: [
                {
                    id: "N10001",
                    category: "sports",
                    topic: "soccer",
                    headline: "Predicting Atlanta United's lineup against Columbus Crew in the U.S. Open Cup",
                    body: "Only FIVE internationals allowed, count em, FIVE! So first off we should say, per our usual Atlanta...",
                    titleEntity: {"Atlanta United's": 'Atlanta United FC'},
                    entityContent: {
                        'Atlanta United FC': {
                            'type': 'item',
                            'id': 'Q16836317',
                            'labels': {'en': {'language': 'en', 'value': 'Atlanta United FC'}}
                        }
                    }
                },
                {
                    id: "N10002",
                    category: "technology",
                    topic: "ai",
                    headline: "Google introduces new AI features in its search engine",
                    body: "Google announced today several new AI-powered features that will transform how users interact with its search engine...",
                    titleEntity: {"Google": "Google LLC"},
                    entityContent: {
                        'Google LLC': {
                            'type': 'item',
                            'id': 'Q95',
                            'labels': {'en': {'language': 'en', 'value': 'Google LLC'}}
                        }
                    }
                },
                {
                    id: "N10003",
                    category: "business",
                    topic: "finance",
                    headline: "Tesla stock surges after beating quarterly earnings expectations",
                    body: "Tesla shares jumped over 8% in after-hours trading after the electric vehicle maker reported stronger than expected Q2 results...",
                    titleEntity: {"Tesla": "Tesla, Inc."},
                    entityContent: {
                        'Tesla, Inc.': {
                            'type': 'item',
                            'id': 'Q478214',
                            'labels': {'en': {'language': 'en', 'value': 'Tesla, Inc.'}}
                        }
                    }
                },
                {
                    id: "N10004",
                    category: "politics",
                    topic: "elections",
                    headline: "President announces re-election campaign with major policy speech",
                    body: "In a widely anticipated address from the White House Rose Garden, the President officially launched a bid for a second term...",
                    titleEntity: {"White House": "White House"},
                    entityContent: {
                        'White House': {
                            'type': 'item',
                            'id': 'Q35525',
                            'labels': {'en': {'language': 'en', 'value': 'White House'}}
                        }
                    }
                },
                {
                    id: "N10005",
                    category: "entertainment",
                    topic: "movies",
                    headline: "New Marvel movie breaks opening weekend box office records",
                    body: "The latest installment in the Marvel Cinematic Universe has shattered opening weekend records, taking in over $300 million domestically...",
                    titleEntity: {"Marvel": "Marvel Studios"},
                    entityContent: {
                        'Marvel Studios': {
                            'type': 'item',
                            'id': 'Q2296977',
                            'labels': {'en': {'language': 'en', 'value': 'Marvel Studios'}}
                        }
                    }
                },
                {
                    id: "N10006",
                    category: "health",
                    topic: "research",
                    headline: "New study shows promising results for Alzheimer's treatment",
                    body: "Researchers at Johns Hopkins have published findings that demonstrate significant cognitive improvements in early-stage Alzheimer's patients...",
                    titleEntity: {"Johns Hopkins": "Johns Hopkins University"},
                    entityContent: {
                        'Johns Hopkins University': {
                            'type': 'item',
                            'id': 'Q193727',
                            'labels': {'en': {'language': 'en', 'value': 'Johns Hopkins University'}}
                        }
                    }
                },
                {
                    id: "N10007",
                    category: "sports",
                    topic: "basketball",
                    headline: "Lakers secure championship with Game 7 victory over Celtics",
                    body: "In a thrilling conclusion to an epic finals series, the Los Angeles Lakers defeated the Boston Celtics 103-98 in Game 7...",
                    titleEntity: {"Lakers": "Los Angeles Lakers"},
                    entityContent: {
                        'Los Angeles Lakers': {
                            'type': 'item',
                            'id': 'Q121783',
                            'labels': {'en': {'language': 'en', 'value': 'Los Angeles Lakers'}}
                        }
                    }
                },
                {
                    id: "N10008",
                    category: "technology",
                    topic: "space",
                    headline: "SpaceX successfully lands Starship prototype after high-altitude test",
                    body: "SpaceX has achieved another milestone in its Starship development program with a successful landing of the SN15 prototype...",
                    titleEntity: {"SpaceX": "SpaceX"},
                    entityContent: {
                        'SpaceX': {
                            'type': 'item',
                            'id': 'Q193701',
                            'labels': {'en': {'language': 'en', 'value': 'SpaceX'}}
                        }
                    }
                },
                {
                    id: "N10009",
                    category: "science",
                    topic: "climate",
                    headline: "Scientists discover new method to capture carbon from atmosphere",
                    body: "A team of international researchers has developed a novel approach to carbon capture that could significantly reduce implementation costs...",
                    titleEntity: {"carbon": "Carbon"},
                    entityContent: {
                        'Carbon': {
                            'type': 'item',
                            'id': 'Q623',
                            'labels': {'en': {'language': 'en', 'value': 'Carbon'}}
                        }
                    }
                },
                {
                    id: "N10010",
                    category: "business",
                    topic: "retail",
                    headline: "Amazon announces plans to open 100 new physical stores",
                    body: "Amazon revealed plans to expand its brick-and-mortar presence with 100 new retail locations set to open across North America next year...",
                    titleEntity: {"Amazon": "Amazon (company)"},
                    entityContent: {
                        'Amazon (company)': {
                            'type': 'item',
                            'id': 'Q3884',
                            'labels': {'en': {'language': 'en', 'value': 'Amazon (company)'}}
                        }
                    }
                },
                {
                    id: "N10011",
                    category: "politics",
                    topic: "international",
                    headline: "UN Security Council passes resolution on climate security",
                    body: "For the first time, the United Nations Security Council has formally recognized climate change as a threat to global security...",
                    titleEntity: {"UN Security Council": "United Nations Security Council"},
                    entityContent: {
                        'United Nations Security Council': {
                            'type': 'item',
                            'id': 'Q37470',
                            'labels': {'en': {'language': 'en', 'value': 'United Nations Security Council'}}
                        }
                    }
                },
                {
                    id: "N10012",
                    category: "entertainment",
                    topic: "music",
                    headline: "Beyoncé announces surprise new album and world tour",
                    body: "The Grammy-winning artist shocked fans today with the unexpected announcement of her eighth studio album and accompanying world tour...",
                    titleEntity: {"Beyoncé": "Beyoncé"},
                    entityContent: {
                        'Beyoncé': {
                            'type': 'item',
                            'id': 'Q36153',
                            'labels': {'en': {'language': 'en', 'value': 'Beyoncé'}}
                        }
                    }
                },
                {
                    id: "N10013",
                    category: "health",
                    topic: "nutrition",
                    headline: "Mediterranean diet linked to decreased risk of heart disease in new study",
                    body: "A comprehensive 20-year study has found strong correlations between adherence to the Mediterranean diet and significantly reduced cardiovascular risk...",
                    titleEntity: {"Mediterranean diet": "Mediterranean diet"},
                    entityContent: {
                        'Mediterranean diet': {
                            'type': 'item',
                            'id': 'Q847754',
                            'labels': {'en': {'language': 'en', 'value': 'Mediterranean diet'}}
                        }
                    }
                },
                {
                    id: "N10014",
                    category: "sports",
                    topic: "tennis",
                    headline: "Nadal wins record-extending 15th French Open title",
                    body: "Rafael Nadal continued his dominance on clay courts with another impressive Roland Garros victory, extending his record to 15 titles...",
                    titleEntity: {"Nadal": "Rafael Nadal"},
                    entityContent: {
                        'Rafael Nadal': {
                            'type': 'item',
                            'id': 'Q10132',
                            'labels': {'en': {'language': 'en', 'value': 'Rafael Nadal'}}
                        }
                    }
                },
                {
                    id: "N10015",
                    category: "technology",
                    topic: "cybersecurity",
                    headline: "Major banking networks face coordinated ransomware attack",
                    body: "Cybersecurity experts are responding to a sophisticated ransomware campaign targeting financial institutions across multiple countries...",
                    titleEntity: {"ransomware": "Ransomware"},
                    entityContent: {
                        'Ransomware': {
                            'type': 'item',
                            'id': 'Q7291661',
                            'labels': {'en': {'language': 'en', 'value': 'Ransomware'}}
                        }
                    }
                },
                {
                    id: "N10016",
                    category: "science",
                    topic: "medicine",
                    headline: "CRISPR gene therapy shows promise in treating rare blood disorders",
                    body: "Initial clinical trials using CRISPR-Cas9 gene editing technology have shown remarkable success in treating patients with sickle cell disease...",
                    titleEntity: {"CRISPR": "CRISPR"},
                    entityContent: {
                        'CRISPR': {
                            'type': 'item',
                            'id': 'Q16525735',
                            'labels': {'en': {'language': 'en', 'value': 'CRISPR'}}
                        }
                    }
                },
                {
                    id: "N10017",
                    category: "business",
                    topic: "automotive",
                    headline: "Toyota unveils ambitious electric vehicle strategy with 10 new models",
                    body: "The world's largest automaker has announced plans to release 10 new fully electric models over the next five years as part of its carbon neutrality goals...",
                    titleEntity: {"Toyota": "Toyota"},
                    entityContent: {
                        'Toyota': {
                            'type': 'item',
                            'id': 'Q53268',
                            'labels': {'en': {'language': 'en', 'value': 'Toyota'}}
                        }
                    }
                },
                {
                    id: "N10018",
                    category: "politics",
                    topic: "legislation",
                    headline: "Senate passes comprehensive infrastructure bill with bipartisan support",
                    body: "After months of negotiations, the Senate has approved a $1.2 trillion infrastructure package that will fund improvements to roads, bridges, and broadband access...",
                    titleEntity: {"Senate": "United States Senate"},
                    entityContent: {
                        'United States Senate': {
                            'type': 'item',
                            'id': 'Q66096',
                            'labels': {'en': {'language': 'en', 'value': 'United States Senate'}}
                        }
                    }
                },
                {
                    id: "N10019",
                    category: "entertainment",
                    topic: "television",
                    headline: "Streaming service announces reboot of classic 90s sitcom",
                    body: "A leading streaming platform has greenlit a revival of the beloved 90s comedy series, with several original cast members confirmed to return...",
                    titleEntity: {"sitcom": "Situation comedy"},
                    entityContent: {
                        'Situation comedy': {
                            'type': 'item',
                            'id': 'Q192889',
                            'labels': {'en': {'language': 'en', 'value': 'Situation comedy'}}
                        }
                    }
                },
                {
                    id: "N10020",
                    category: "health",
                    topic: "mental health",
                    headline: "New research identifies biological markers for depression",
                    body: "Scientists have identified specific biomarkers in blood samples that could lead to more objective diagnosis and personalized treatment of depression...",
                    titleEntity: {"depression": "Major depressive disorder"},
                    entityContent: {
                        'Major depressive disorder': {
                            'type': 'item',
                            'id': 'Q12194',
                            'labels': {'en': {'language': 'en', 'value': 'Major depressive disorder'}}
                        }
                    }
                }
            ],
            // 新闻点击历史数据 - 记录每条新闻在过去14天内的点击次数
            newsClickHistory: {
                "N10001": [
                    {date: "2023-07-04", count: 45},
                    {date: "2023-07-05", count: 52},
                    {date: "2023-07-06", count: 48},
                    {date: "2023-07-07", count: 60},
                    {date: "2023-07-08", count: 72},
                    {date: "2023-07-09", count: 85},
                    {date: "2023-07-10", count: 93},
                    {date: "2023-07-11", count: 88},
                    {date: "2023-07-12", count: 76},
                    {date: "2023-07-13", count: 65},
                    {date: "2023-07-14", count: 58},
                    {date: "2023-07-15", count: 52},
                    {date: "2023-07-16", count: 48},
                    {date: "2023-07-17", count: 42}
                ],
                "N10002": [
                    {date: "2023-07-04", count: 120},
                    {date: "2023-07-05", count: 145},
                    {date: "2023-07-06", count: 188},
                    {date: "2023-07-07", count: 230},
                    {date: "2023-07-08", count: 310},
                    {date: "2023-07-09", count: 345},
                    {date: "2023-07-10", count: 320},
                    {date: "2023-07-11", count: 290},
                    {date: "2023-07-12", count: 240},
                    {date: "2023-07-13", count: 210},
                    {date: "2023-07-14", count: 180},
                    {date: "2023-07-15", count: 160},
                    {date: "2023-07-16", count: 140},
                    {date: "2023-07-17", count: 130}
                ],
                "N10003": [
                    {date: "2023-07-04", count: 80},
                    {date: "2023-07-05", count: 78},
                    {date: "2023-07-06", count: 92},
                    {date: "2023-07-07", count: 105},
                    {date: "2023-07-08", count: 145},
                    {date: "2023-07-09", count: 168},
                    {date: "2023-07-10", count: 198},
                    {date: "2023-07-11", count: 232},
                    {date: "2023-07-12", count: 267},
                    {date: "2023-07-13", count: 245},
                    {date: "2023-07-14", count: 210},
                    {date: "2023-07-15", count: 178},
                    {date: "2023-07-16", count: 152},
                    {date: "2023-07-17", count: 135}
                ],
                "N10004": [
                    {date: "2023-07-04", count: 95},
                    {date: "2023-07-05", count: 102},
                    {date: "2023-07-06", count: 108},
                    {date: "2023-07-07", count: 115},
                    {date: "2023-07-08", count: 132},
                    {date: "2023-07-09", count: 148},
                    {date: "2023-07-10", count: 162},
                    {date: "2023-07-11", count: 175},
                    {date: "2023-07-12", count: 168},
                    {date: "2023-07-13", count: 156},
                    {date: "2023-07-14", count: 143},
                    {date: "2023-07-15", count: 130},
                    {date: "2023-07-16", count: 122},
                    {date: "2023-07-17", count: 115}
                ],
                "N10005": [
                    {date: "2023-07-04", count: 150},
                    {date: "2023-07-05", count: 162},
                    {date: "2023-07-06", count: 175},
                    {date: "2023-07-07", count: 195},
                    {date: "2023-07-08", count: 208},
                    {date: "2023-07-09", count: 220},
                    {date: "2023-07-10", count: 215},
                    {date: "2023-07-11", count: 195},
                    {date: "2023-07-12", count: 175},
                    {date: "2023-07-13", count: 155},
                    {date: "2023-07-14", count: 140},
                    {date: "2023-07-15", count: 130},
                    {date: "2023-07-16", count: 125},
                    {date: "2023-07-17", count: 120}
                ],
                "N10006": [
                    {date: "2023-07-04", count: 65},
                    {date: "2023-07-05", count: 68},
                    {date: "2023-07-06", count: 72},
                    {date: "2023-07-07", count: 75},
                    {date: "2023-07-08", count: 80},
                    {date: "2023-07-09", count: 85},
                    {date: "2023-07-10", count: 110},
                    {date: "2023-07-11", count: 135},
                    {date: "2023-07-12", count: 155},
                    {date: "2023-07-13", count: 165},
                    {date: "2023-07-14", count: 175},
                    {date: "2023-07-15", count: 172},
                    {date: "2023-07-16", count: 168},
                    {date: "2023-07-17", count: 160}
                ],
                "N10007": [
                    {date: "2023-07-04", count: 110},
                    {date: "2023-07-05", count: 125},
                    {date: "2023-07-06", count: 140},
                    {date: "2023-07-07", count: 155},
                    {date: "2023-07-08", count: 180},
                    {date: "2023-07-09", count: 210},
                    {date: "2023-07-10", count: 240},
                    {date: "2023-07-11", count: 220},
                    {date: "2023-07-12", count: 195},
                    {date: "2023-07-13", count: 175},
                    {date: "2023-07-14", count: 155},
                    {date: "2023-07-15", count: 140},
                    {date: "2023-07-16", count: 130},
                    {date: "2023-07-17", count: 120}
                ],
                "N10008": [
                    {date: "2023-07-04", count: 85},
                    {date: "2023-07-05", count: 90},
                    {date: "2023-07-06", count: 95},
                    {date: "2023-07-07", count: 110},
                    {date: "2023-07-08", count: 120},
                    {date: "2023-07-09", count: 135},
                    {date: "2023-07-10", count: 160},
                    {date: "2023-07-11", count: 190},
                    {date: "2023-07-12", count: 215},
                    {date: "2023-07-13", count: 235},
                    {date: "2023-07-14", count: 245},
                    {date: "2023-07-15", count: 235},
                    {date: "2023-07-16", count: 220},
                    {date: "2023-07-17", count: 205}
                ],
                "N10009": [
                    {date: "2023-07-04", count: 45},
                    {date: "2023-07-05", count: 48},
                    {date: "2023-07-06", count: 52},
                    {date: "2023-07-07", count: 55},
                    {date: "2023-07-08", count: 60},
                    {date: "2023-07-09", count: 75},
                    {date: "2023-07-10", count: 95},
                    {date: "2023-07-11", count: 120},
                    {date: "2023-07-12", count: 145},
                    {date: "2023-07-13", count: 160},
                    {date: "2023-07-14", count: 175},
                    {date: "2023-07-15", count: 185},
                    {date: "2023-07-16", count: 180},
                    {date: "2023-07-17", count: 170}
                ],
                "N10010": [
                    {date: "2023-07-04", count: 95},
                    {date: "2023-07-05", count: 105},
                    {date: "2023-07-06", count: 120},
                    {date: "2023-07-07", count: 140},
                    {date: "2023-07-08", count: 165},
                    {date: "2023-07-09", count: 180},
                    {date: "2023-07-10", count: 190},
                    {date: "2023-07-11", count: 185},
                    {date: "2023-07-12", count: 170},
                    {date: "2023-07-13", count: 155},
                    {date: "2023-07-14", count: 140},
                    {date: "2023-07-15", count: 130},
                    {date: "2023-07-16", count: 125},
                    {date: "2023-07-17", count: 120}
                ],
                "N10011": [
                    {date: "2023-07-04", count: 70},
                    {date: "2023-07-05", count: 75},
                    {date: "2023-07-06", count: 80},
                    {date: "2023-07-07", count: 88},
                    {date: "2023-07-08", count: 95},
                    {date: "2023-07-09", count: 105},
                    {date: "2023-07-10", count: 118},
                    {date: "2023-07-11", count: 135},
                    {date: "2023-07-12", count: 160},
                    {date: "2023-07-13", count: 178},
                    {date: "2023-07-14", count: 195},
                    {date: "2023-07-15", count: 210},
                    {date: "2023-07-16", count: 220},
                    {date: "2023-07-17", count: 225}
                ],
                "N10012": [
                    {date: "2023-07-04", count: 130},
                    {date: "2023-07-05", count: 145},
                    {date: "2023-07-06", count: 165},
                    {date: "2023-07-07", count: 190},
                    {date: "2023-07-08", count: 220},
                    {date: "2023-07-09", count: 250},
                    {date: "2023-07-10", count: 270},
                    {date: "2023-07-11", count: 260},
                    {date: "2023-07-12", count: 240},
                    {date: "2023-07-13", count: 215},
                    {date: "2023-07-14", count: 190},
                    {date: "2023-07-15", count: 170},
                    {date: "2023-07-16", count: 155},
                    {date: "2023-07-17", count: 145}
                ],
                "N10013": [
                    {date: "2023-07-04", count: 60},
                    {date: "2023-07-05", count: 62},
                    {date: "2023-07-06", count: 65},
                    {date: "2023-07-07", count: 70},
                    {date: "2023-07-08", count: 78},
                    {date: "2023-07-09", count: 85},
                    {date: "2023-07-10", count: 95},
                    {date: "2023-07-11", count: 105},
                    {date: "2023-07-12", count: 115},
                    {date: "2023-07-13", count: 120},
                    {date: "2023-07-14", count: 125},
                    {date: "2023-07-15", count: 122},
                    {date: "2023-07-16", count: 118},
                    {date: "2023-07-17", count: 110}
                ],
                "N10014": [
                    {date: "2023-07-04", count: 85},
                    {date: "2023-07-05", count: 92},
                    {date: "2023-07-06", count: 105},
                    {date: "2023-07-07", count: 120},
                    {date: "2023-07-08", count: 142},
                    {date: "2023-07-09", count: 165},
                    {date: "2023-07-10", count: 180},
                    {date: "2023-07-11", count: 172},
                    {date: "2023-07-12", count: 160},
                    {date: "2023-07-13", count: 145},
                    {date: "2023-07-14", count: 130},
                    {date: "2023-07-15", count: 120},
                    {date: "2023-07-16", count: 112},
                    {date: "2023-07-17", count: 105}
                ],
                "N10015": [
                    {date: "2023-07-04", count: 100},
                    {date: "2023-07-05", count: 105},
                    {date: "2023-07-06", count: 112},
                    {date: "2023-07-07", count: 125},
                    {date: "2023-07-08", count: 140},
                    {date: "2023-07-09", count: 160},
                    {date: "2023-07-10", count: 185},
                    {date: "2023-07-11", count: 210},
                    {date: "2023-07-12", count: 230},
                    {date: "2023-07-13", count: 240},
                    {date: "2023-07-14", count: 235},
                    {date: "2023-07-15", count: 220},
                    {date: "2023-07-16", count: 200},
                    {date: "2023-07-17", count: 180}
                ],
                "N10016": [
                    {date: "2023-07-04", count: 75},
                    {date: "2023-07-05", count: 78},
                    {date: "2023-07-06", count: 82},
                    {date: "2023-07-07", count: 88},
                    {date: "2023-07-08", count: 95},
                    {date: "2023-07-09", count: 105},
                    {date: "2023-07-10", count: 120},
                    {date: "2023-07-11", count: 135},
                    {date: "2023-07-12", count: 150},
                    {date: "2023-07-13", count: 162},
                    {date: "2023-07-14", count: 170},
                    {date: "2023-07-15", count: 168},
                    {date: "2023-07-16", count: 160},
                    {date: "2023-07-17", count: 152}
                ],
                "N10017": [
                    {date: "2023-07-04", count: 90},
                    {date: "2023-07-05", count: 95},
                    {date: "2023-07-06", count: 102},
                    {date: "2023-07-07", count: 110},
                    {date: "2023-07-08", count: 125},
                    {date: "2023-07-09", count: 140},
                    {date: "2023-07-10", count: 155},
                    {date: "2023-07-11", count: 165},
                    {date: "2023-07-12", count: 160},
                    {date: "2023-07-13", count: 150},
                    {date: "2023-07-14", count: 140},
                    {date: "2023-07-15", count: 130},
                    {date: "2023-07-16", count: 125},
                    {date: "2023-07-17", count: 120}
                ],
                "N10018": [
                    {date: "2023-07-04", count: 110},
                    {date: "2023-07-05", count: 115},
                    {date: "2023-07-06", count: 125},
                    {date: "2023-07-07", count: 138},
                    {date: "2023-07-08", count: 155},
                    {date: "2023-07-09", count: 170},
                    {date: "2023-07-10", count: 182},
                    {date: "2023-07-11", count: 175},
                    {date: "2023-07-12", count: 165},
                    {date: "2023-07-13", count: 152},
                    {date: "2023-07-14", count: 140},
                    {date: "2023-07-15", count: 132},
                    {date: "2023-07-16", count: 128},
                    {date: "2023-07-17", count: 125}
                ],
                "N10019": [
                    {date: "2023-07-04", count: 105},
                    {date: "2023-07-05", count: 112},
                    {date: "2023-07-06", count: 120},
                    {date: "2023-07-07", count: 130},
                    {date: "2023-07-08", count: 145},
                    {date: "2023-07-09", count: 160},
                    {date: "2023-07-10", count: 170},
                    {date: "2023-07-11", count: 165},
                    {date: "2023-07-12", count: 155},
                    {date: "2023-07-13", count: 142},
                    {date: "2023-07-14", count: 132},
                    {date: "2023-07-15", count: 125},
                    {date: "2023-07-16", count: 120},
                    {date: "2023-07-17", count: 118}
                ],
                "N10020": [
                    {date: "2023-07-04", count: 65},
                    {date: "2023-07-05", count: 68},
                    {date: "2023-07-06", count: 72},
                    {date: "2023-07-07", count: 78},
                    {date: "2023-07-08", count: 85},
                    {date: "2023-07-09", count: 95},
                    {date: "2023-07-10", count: 108},
                    {date: "2023-07-11", count: 125},
                    {date: "2023-07-12", count: 140},
                    {date: "2023-07-13", count: 152},
                    {date: "2023-07-14", count: 160},
                    {date: "2023-07-15", count: 162},
                    {date: "2023-07-16", count: 158},
                    {date: "2023-07-17", count: 150}
                ]
            },
            // 在 NewsPanel.js 的 data 方法中添加分类热度数据
            categoryClickHistory: {
                "sports": [
                    {date: "2023-07-04", count: 240},
                    {date: "2023-07-05", count: 269},
                    {date: "2023-07-06", count: 293},
                    {date: "2023-07-07", count: 335},
                    {date: "2023-07-08", count: 394},
                    {date: "2023-07-09", count: 460},
                    {date: "2023-07-10", count: 513},
                    {date: "2023-07-11", count: 480},
                    {date: "2023-07-12", count: 431},
                    {date: "2023-07-13", count: 385},
                    {date: "2023-07-14", count: 343},
                    {date: "2023-07-15", count: 312},
                    {date: "2023-07-16", count: 290},
                    {date: "2023-07-17", count: 267}
                ],
                "technology": [
                    {date: "2023-07-04", count: 305},
                    {date: "2023-07-05", count: 340},
                    {date: "2023-07-06", count: 395},
                    {date: "2023-07-07", count: 465},
                    {date: "2023-07-08", count: 570},
                    {date: "2023-07-09", count: 640},
                    {date: "2023-07-10", count: 665},
                    {date: "2023-07-11", count: 690},
                    {date: "2023-07-12", count: 685},
                    {date: "2023-07-13", count: 685},
                    {date: "2023-07-14", count: 660},
                    {date: "2023-07-15", count: 615},
                    {date: "2023-07-16", count: 560},
                    {date: "2023-07-17", count: 515}
                ],
                "business": [
                    {date: "2023-07-04", count: 265},
                    {date: "2023-07-05", count: 278},
                    {date: "2023-07-06", count: 314},
                    {date: "2023-07-07", count: 355},
                    {date: "2023-07-08", count: 430},
                    {date: "2023-07-09", count: 488},
                    {date: "2023-07-10", count: 543},
                    {date: "2023-07-11", count: 582},
                    {date: "2023-07-12", count: 597},
                    {date: "2023-07-13", count: 550},
                    {date: "2023-07-14", count: 490},
                    {date: "2023-07-15", count: 438},
                    {date: "2023-07-16", count: 402},
                    {date: "2023-07-17", count: 375}
                ],
                "politics": [
                    {date: "2023-07-04", count: 275},
                    {date: "2023-07-05", count: 292},
                    {date: "2023-07-06", count: 313},
                    {date: "2023-07-07", count: 341},
                    {date: "2023-07-08", count: 382},
                    {date: "2023-07-09", count: 423},
                    {date: "2023-07-10", count: 462},
                    {date: "2023-07-11", count: 485},
                    {date: "2023-07-12", count: 493},
                    {date: "2023-07-13", count: 486},
                    {date: "2023-07-14", count: 478},
                    {date: "2023-07-15", count: 472},
                    {date: "2023-07-16", count: 470},
                    {date: "2023-07-17", count: 465}
                ],
                "entertainment": [
                    {date: "2023-07-04", count: 385},
                    {date: "2023-07-05", count: 419},
                    {date: "2023-07-06", count: 460},
                    {date: "2023-07-07", count: 515},
                    {date: "2023-07-08", count: 573},
                    {date: "2023-07-09", count: 630},
                    {date: "2023-07-10", count: 655},
                    {date: "2023-07-11", count: 625},
                    {date: "2023-07-12", count: 570},
                    {date: "2023-07-13", count: 512},
                    {date: "2023-07-14", count: 462},
                    {date: "2023-07-15", count: 425},
                    {date: "2023-07-16", count: 400},
                    {date: "2023-07-17", count: 383}
                ],
                "health": [
                    {date: "2023-07-04", count: 190},
                    {date: "2023-07-05", count: 198},
                    {date: "2023-07-06", count: 209},
                    {date: "2023-07-07", count: 223},
                    {date: "2023-07-08", count: 243},
                    {date: "2023-07-09", count: 265},
                    {date: "2023-07-10", count: 313},
                    {date: "2023-07-11", count: 365},
                    {date: "2023-07-12", count: 410},
                    {date: "2023-07-13", count: 437},
                    {date: "2023-07-14", count: 460},
                    {date: "2023-07-15", count: 452},
                    {date: "2023-07-16", count: 436},
                    {date: "2023-07-17", count: 420}
                ],
                "science": [
                    {date: "2023-07-04", count: 120},
                    {date: "2023-07-05", count: 126},
                    {date: "2023-07-06", count: 134},
                    {date: "2023-07-07", count: 143},
                    {date: "2023-07-08", count: 155},
                    {date: "2023-07-09", count: 180},
                    {date: "2023-07-10", count: 215},
                    {date: "2023-07-11", count: 255},
                    {date: "2023-07-12", count: 295},
                    {date: "2023-07-13", count: 322},
                    {date: "2023-07-14", count: 345},
                    {date: "2023-07-15", count: 353},
                    {date: "2023-07-16", count: 340},
                    {date: "2023-07-17", count: 322}
                ]
            },
            hoveredCategory: null,  // 当前悬停的分类
            hoverChartInstance: null, // 悬浮图表实例
            filterCategory: '', // 分类筛选
            filterTopic: '',    // 主题筛选
            searchText: '',     // 搜索文本
            selectedNews: [],   // 选中的新闻数组，最多两条
            chartInstance: null // 图表实例
        }
    },
    watch: {
        selectedNews: {
            deep: true,
            handler() {
                this.updateChart();
            }
        }
    },
    mounted: function () {
        this.$nextTick(() => {
            this.initChart();
        });
    },
    methods: {
        getCategoryColor(category) {
            const colorMap = {
                'sports': '#2196F3',
                'technology': '#4CAF50',
                'business': '#FF9800',
                'politics': '#F44336',
                'entertainment': '#9C27B0',
                'health': '#00BCD4',
                'science': '#8BC34A'
            };
            return colorMap[category] || '#9E9E9E';
        },
        // 处理行点击事件
        handleRowClick(row) {
            const startTime = performance.now();

            // 原有代码
            const index = this.selectedNews.findIndex(news => news.id === row.id);
            if (index > -1) {
                this.selectedNews.splice(index, 1);
            } else {
                if (this.selectedNews.length < 2) {
                    this.selectedNews.push(row);
                } else {
                    this.selectedNews.shift();
                    this.selectedNews.push(row);
                }
            }

            const endTime = performance.now();
            pipeService.emitQueryLog({
                source: 'NewsPanel',
                action: `${index > -1 ? '取消选择' : '选择'}新闻 ${row.id}`,
                timestamp: Date.now(),
                responseTime: Math.round(endTime - startTime),
                resultCount: this.selectedNews.length
            });
        },


        // 检查新闻是否被选中
        isNewsSelected(newsId) {
            return this.selectedNews.some(news => news.id === newsId);
        },

        // 更新图表数据
        updateChart() {
            if (!this.chartInstance) return;
            const startTime = performance.now();
            // 准备图表配置
            const option = {
                title: {
                    text: '新闻热度变化趋势',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function(params) {
                        let result = params[0].axisValueLabel + '<br/>';
                        params.forEach(param => {
                            result += `${param.marker} ${param.seriesName}: ${param.value} 次点击<br/>`;
                        });
                        return result;
                    }
                },
                // 移除底部图例
                legend: {
                    show: false
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '8%', // 底部空间减少
                    top: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: this.dateRange,
                    axisLabel: {
                        formatter: (value) => value.substring(5) // 只显示月-日
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '点击次数'
                },
                series: this.getChartSeries()
            };

            // 应用配置
            this.chartInstance.setOption(option);
            const endTime = performance.now();
            pipeService.emitQueryLog({
                source: 'NewsPanel',
                action: '更新新闻趋势图表',
                timestamp: Date.now(),
                responseTime: Math.round(endTime - startTime),
                resultCount: this.selectedNews.length
            });
        },

        // 获取图表系列数据
        getChartSeries() {
            return this.selectedNews.map(news => {
                const clickData = this.newsClickHistory[news.id] || [];

                // 确保数据与日期范围一致
                const data = this.dateRange.map(date => {
                    const record = clickData.find(item => item.date === date);
                    return record ? record.count : 0;
                });

                return {
                    name: news.headline,
                    type: 'line',
                    data: data,
                    smooth: true,
                    lineStyle: {
                        color: this.getTopicColor(news.topic),
                        width: 3
                    },
                    itemStyle: {
                        color: this.getTopicColor(news.topic)
                    },
                    emphasis: {
                        focus: 'series'
                    }
                };
            });
        },

        // 清空选中的新闻
        // 修改 clearSelectedNews 方法确保图表被清空
        clearSelectedNews() {
            this.selectedNews = [];

            // 确保图表显示为空状态
            if (this.chartInstance) {
                const emptyOption = {
                    title: {
                        text: '新闻热度变化趋势',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        show: false
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '8%',
                        top: '15%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: this.dateRange,
                        axisLabel: {
                            formatter: (value) => value.substring(5)
                        }
                    },
                    yAxis: {
                        type: 'value',
                        name: '点击次数'
                    },
                    series: [] // 空系列数据
                };

                this.chartInstance.setOption(emptyOption, true);

            }
        },
        // 获取主题颜色方法
        getTopicColor(topic) {
            const colorMap = {
                'soccer': '#1565C0',
                'basketball': '#0D47A1',
                'tennis': '#0277BD',
                'ai': '#2E7D32',
                'space': '#1B5E20',
                'cybersecurity': '#388E3C',
                'finance': '#EF6C00',
                'retail': '#E65100',
                'automotive': '#F57F17',
                'elections': '#C62828',
                'international': '#B71C1C',
                'legislation': '#D32F2F',
                'movies': '#7B1FA2',
                'music': '#6A1B9A',
                'television': '#4A148C',
                'research': '#00838F',
                'nutrition': '#006064',
                'mental health': '#00695C',
                'climate': '#558B2F',
                'medicine': '#33691E'
            };
            return colorMap[topic] || '#607D8B';
        },
        // 初始化图表
        initChart() {
            const chartDom = document.getElementById('news-trend-chart');
            if (chartDom) {
                this.chartInstance = echarts.init(chartDom);
                this.updateChart();
            }

            // 初始化悬浮图表（但不显示）
            const hoverChartDom = document.getElementById('category-hover-chart');
            if (hoverChartDom) {
                this.hoverChartInstance = echarts.init(hoverChartDom);
            }
        },

        // 处理分类标签悬停
        handleCategoryHover(category, event) {
            this.hoveredCategory = category;

            if (category) {
                // 显示悬浮图表
                const hoverContainer = document.getElementById('hover-chart-container');
                if (hoverContainer && event) {
                    // 定位悬浮图表
                    const rect = event.target.getBoundingClientRect();
                    const container = document.querySelector('.news-chart-container').getBoundingClientRect();

                    hoverContainer.style.top = (rect.bottom - container.top + 10) + 'px';
                    hoverContainer.style.left = (rect.left - container.left) + 'px';

                    this.$nextTick(() => {
                        this.updateHoverChart(category);
                    });
                }
            }
        },

        // 更新悬浮图表
        // 修改 updateHoverChart 方法中的图表配置
        updateHoverChart(category) {
            if (!this.hoverChartInstance || !category) return;
            const startTime = performance.now();
            const categoryData = this.categoryClickHistory[category] || [];
            const data = this.dateRange.map(date => {
                const record = categoryData.find(item => item.date === date);
                return record ? record.count : 0;
            });

            const option = {
                tooltip: {
                    trigger: 'axis',
                    formatter: function(params) {
                        let result = params[0].axisValueLabel + '<br/>';
                        params.forEach(param => {
                            result += `${param.marker} ${param.seriesName}: ${param.value} 次点击<br/>`;
                        });
                        return result;
                    }
                },
                grid: {
                    left: '10%',
                    right: '5%',
                    bottom: '15%',
                    top: '15%',  // 从10%增加到15%，给顶部留更多空间
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: this.dateRange,
                    axisLabel: {
                        formatter: (value) => value.substring(5),
                        fontSize: 10
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '点击次数',
                    nameTextStyle: {
                        fontSize: 10
                    },
                    axisLabel: {
                        fontSize: 10
                    }
                },
                series: [{
                    name: `${category} 分类热度`,
                    type: 'line',
                    data: data,
                    smooth: true,
                    lineStyle: {
                        color: this.getCategoryColor(category),
                        width: 2
                    },
                    itemStyle: {
                        color: this.getCategoryColor(category)
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    // 使用区域填充
                    areaStyle: {
                        opacity: 0.3,
                        color: this.getCategoryColor(category)
                    }
                }]
            };

            this.hoverChartInstance.setOption(option);

            // 调整大小以适应容器
            this.hoverChartInstance.resize();
            const endTime = performance.now();
            pipeService.emitQueryLog({
                source: 'NewsPanel',
                action: `查询分类热度 (${category})`,
                timestamp: Date.now(),
                responseTime: Math.round(endTime - startTime),
                resultCount: data.length
            });
        }
    }
}