// =============================================
// 星骰数据 — 行星 × 星座 × 宫位
// =============================================

const PLANETS = [
    { id: "sun", name: "太阳", symbol: "☉", meaning: "自我、核心、生命力、意志" },
    { id: "moon", name: "月亮", symbol: "☽", meaning: "情感、潜意识、直觉、习惯" },
    { id: "mercury", name: "水星", symbol: "☿", meaning: "沟通、思维、交流、学习" },
    { id: "venus", name: "金星", symbol: "♀", meaning: "爱情、审美、价值、和谐" },
    { id: "mars", name: "火星", symbol: "♂", meaning: "行动、欲望、勇气、竞争" },
    { id: "jupiter", name: "木星", symbol: "♃", meaning: "幸运、扩张、智慧、成长" },
    { id: "saturn", name: "土星", symbol: "♄", meaning: "责任、限制、纪律、功课" },
    { id: "uranus", name: "天王星", symbol: "♅", meaning: "变革、创新、自由、突破" },
    { id: "neptune", name: "海王星", symbol: "♆", meaning: "梦幻、灵感、消融、灵性" },
    { id: "pluto", name: "冥王星", symbol: "♇", meaning: "蜕变、深层、权力、重生" },
    { id: "north_node", name: "北交点", symbol: "☊", meaning: "成长方向、人生课题、命运" },
    { id: "south_node", name: "南交点", symbol: "☋", meaning: "过去习惯、舒适区、业力" }
];

const SIGNS = [
    { id: "aries", name: "白羊座", symbol: "♈", element: "火", meaning: "开创、勇敢、直接、冲劲" },
    { id: "taurus", name: "金牛座", symbol: "♉", element: "土", meaning: "稳定、享受、固执、务实" },
    { id: "gemini", name: "双子座", symbol: "♊", element: "风", meaning: "多变、好奇、沟通、灵活" },
    { id: "cancer", name: "巨蟹座", symbol: "♋", element: "水", meaning: "情感、保护、敏感、家庭" },
    { id: "leo", name: "狮子座", symbol: "♌", element: "火", meaning: "自信、表现、热情、领导" },
    { id: "virgo", name: "处女座", symbol: "♍", element: "土", meaning: "分析、完美、服务、细节" },
    { id: "libra", name: "天秤座", symbol: "♎", element: "风", meaning: "平衡、审美、合作、公正" },
    { id: "scorpio", name: "天蝎座", symbol: "♏", element: "水", meaning: "深度、洞察、蜕变、掌控" },
    { id: "sagittarius", name: "射手座", symbol: "♐", element: "火", meaning: "探索、自由、乐观、追求" },
    { id: "capricorn", name: "摩羯座", symbol: "♑", element: "土", meaning: "野心、自律、成就、责任" },
    { id: "aquarius", name: "水瓶座", symbol: "♒", element: "风", meaning: "创新、独立、人道、前卫" },
    { id: "pisces", name: "双鱼座", symbol: "♓", element: "水", meaning: "梦幻、共情、艺术、灵性" }
];

const HOUSES = [
    { id: 1, name: "第1宫", symbol: "I", meaning: "自我形象、外在表现、新开始" },
    { id: 2, name: "第2宫", symbol: "II", meaning: "财富、价值观、资源、自我价值" },
    { id: 3, name: "第3宫", symbol: "III", meaning: "沟通、学习、兄弟姐妹、短途旅行" },
    { id: 4, name: "第4宫", symbol: "IV", meaning: "家庭、根源、内心世界、安全感" },
    { id: 5, name: "第5宫", symbol: "V", meaning: "创造、恋爱、娱乐、子女、表现" },
    { id: 6, name: "第6宫", symbol: "VI", meaning: "工作、健康、日常、服务" },
    { id: 7, name: "第7宫", symbol: "VII", meaning: "伴侣、合作、婚姻、公开关系" },
    { id: 8, name: "第8宫", symbol: "VIII", meaning: "深层连接、危机、转变、共享资源" },
    { id: 9, name: "第9宫", symbol: "IX", meaning: "旅行、哲学、高等教育、信仰" },
    { id: 10, name: "第10宫", symbol: "X", meaning: "事业、社会地位、成就、名声" },
    { id: 11, name: "第11宫", symbol: "XI", meaning: "社交、朋友、理想、团体" },
    { id: 12, name: "第12宫", symbol: "XII", meaning: "潜意识、独处、灵性、隐藏" }
];

function generateAstroDice() {
    const planet = PLANETS[Math.floor(Math.random() * PLANETS.length)];
    const sign = SIGNS[Math.floor(Math.random() * SIGNS.length)];
    const house = HOUSES[Math.floor(Math.random() * HOUSES.length)];
    return { planet, sign, house };
}
