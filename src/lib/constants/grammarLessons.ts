import { LucideIcon } from 'lucide-react';

// Types
export interface GrammarExample {
    sentence: string;
    translation: string;
    highlight?: string;
}

export interface GrammarSection {
    id: string;
    heading: string;
    headingVi: string;
    content: string;
    contentVi: string;
    examples: GrammarExample[];
}

export interface GrammarExercise {
    id: string;
    type: 'fill-blank' | 'choose' | 'combine' | 'transform';
    question: string;
    questionVi?: string;
    answer: string;
    options?: string[];
    explanation?: string;
}

export interface GrammarLesson {
    id: string;
    title: string;
    titleVi: string;
    category: 'tenses' | 'structures' | 'verbs' | 'others';
    level: 'beginner' | 'lower-intermediate' | 'intermediate' | 'upper-intermediate';
    order: number;
    sections: GrammarSection[];
    exercises: GrammarExercise[];
}

// ============================================
// TENSES - 12 Topics
// ============================================

const TENSES_LESSONS: GrammarLesson[] = [
    {
        id: 'present-simple',
        title: 'Present Simple',
        titleVi: 'Thì Hiện Tại Đơn',
        category: 'tenses',
        level: 'beginner',
        order: 1,
        sections: [
            {
                id: 'ps-intro',
                heading: 'What is Present Simple?',
                headingVi: 'Thì Hiện Tại Đơn là gì?',
                content: 'The Present Simple is used to describe habits, general truths, and repeated actions.',
                contentVi: 'Thì Hiện Tại Đơn dùng để diễn tả thói quen, sự thật hiển nhiên và hành động lặp đi lặp lại.',
                examples: [
                    { sentence: 'I **work** every day.', translation: 'Tôi làm việc mỗi ngày.', highlight: 'work' },
                    { sentence: 'The sun **rises** in the east.', translation: 'Mặt trời mọc ở phía đông.', highlight: 'rises' },
                    { sentence: 'She **doesn\'t** like coffee.', translation: 'Cô ấy không thích cà phê.', highlight: "doesn't" }
                ]
            },
            {
                id: 'ps-form',
                heading: 'How to Form',
                headingVi: 'Cách chia',
                content: '**Positive:** Subject + V(s/es)\n**Negative:** Subject + do/does + not + V\n**Question:** Do/Does + Subject + V?',
                contentVi: '**Khẳng định:** Chủ ngữ + V(s/es)\n**Phủ định:** Chủ ngữ + do/does + not + V\n**Nghi vấn:** Do/Does + Chủ ngữ + V?',
                examples: [
                    { sentence: 'He **plays** football.', translation: 'Anh ấy chơi bóng đá.', highlight: 'plays' },
                    { sentence: '**Does** she speak English?', translation: 'Cô ấy có nói tiếng Anh không?', highlight: 'Does' }
                ]
            }
        ],
        exercises: [
            { id: 'ps-ex1', type: 'fill-blank', question: 'She ___ (go) to school every day.', answer: 'goes', explanation: 'He/She/It + V-s/es' },
            { id: 'ps-ex2', type: 'choose', question: 'They ___ coffee in the morning.', answer: 'drink', options: ['drinks', 'drink', 'drinking', 'drank'] }
        ]
    },
    {
        id: 'present-continuous',
        title: 'Present Continuous',
        titleVi: 'Thì Hiện Tại Tiếp Diễn',
        category: 'tenses',
        level: 'beginner',
        order: 2,
        sections: [
            {
                id: 'pc-intro',
                heading: 'What is Present Continuous?',
                headingVi: 'Thì Hiện Tại Tiếp Diễn là gì?',
                content: 'The Present Continuous is used for actions happening now or around now.',
                contentVi: 'Thì Hiện Tại Tiếp Diễn dùng cho hành động đang xảy ra ở thời điểm nói hoặc xung quanh thời điểm nói.',
                examples: [
                    { sentence: 'I **am working** now.', translation: 'Tôi đang làm việc.', highlight: 'am working' },
                    { sentence: 'She **is studying** English.', translation: 'Cô ấy đang học tiếng Anh.', highlight: 'is studying' }
                ]
            },
            {
                id: 'pc-form',
                heading: 'How to Form',
                headingVi: 'Cách chia',
                content: '**Form:** Subject + am/is/are + V-ing',
                contentVi: '**Công thức:** Chủ ngữ + am/is/are + V-ing',
                examples: [
                    { sentence: 'They **are playing** tennis.', translation: 'Họ đang chơi tennis.', highlight: 'are playing' }
                ]
            }
        ],
        exercises: [
            { id: 'pc-ex1', type: 'fill-blank', question: 'Look! The baby ___ (cry).', answer: 'is crying' },
            { id: 'pc-ex2', type: 'transform', question: 'She reads a book. (Make it continuous)', answer: 'She is reading a book.' }
        ]
    },
    {
        id: 'present-perfect',
        title: 'Present Perfect',
        titleVi: 'Thì Hiện Tại Hoàn Thành',
        category: 'tenses',
        level: 'lower-intermediate',
        order: 3,
        sections: [
            {
                id: 'pp-intro',
                heading: 'What is Present Perfect?',
                headingVi: 'Thì Hiện Tại Hoàn Thành là gì?',
                content: 'The Present Perfect connects the past to the present. Used for experiences, changes, and unfinished actions.',
                contentVi: 'Thì Hiện Tại Hoàn Thành kết nối quá khứ với hiện tại. Dùng cho trải nghiệm, sự thay đổi và hành động chưa hoàn thành.',
                examples: [
                    { sentence: 'I **have visited** Paris.', translation: 'Tôi đã đến Paris.', highlight: 'have visited' },
                    { sentence: 'She **has lived** here for 5 years.', translation: 'Cô ấy đã sống ở đây 5 năm.', highlight: 'has lived' }
                ]
            },
            {
                id: 'pp-form',
                heading: 'How to Form',
                headingVi: 'Cách chia',
                content: '**Form:** Subject + have/has + Past Participle (V3)',
                contentVi: '**Công thức:** Chủ ngữ + have/has + Quá khứ phân từ (V3)',
                examples: [
                    { sentence: 'They **have finished** the project.', translation: 'Họ đã hoàn thành dự án.', highlight: 'have finished' }
                ]
            }
        ],
        exercises: [
            { id: 'pp-ex1', type: 'fill-blank', question: 'I ___ never ___ (eat) sushi.', answer: 'have never eaten' },
            { id: 'pp-ex2', type: 'choose', question: 'She ___ here since 2020.', answer: 'has lived', options: ['lived', 'has lived', 'is living', 'lives'] }
        ]
    },
    {
        id: 'present-perfect-continuous',
        title: 'Present Perfect Continuous',
        titleVi: 'Thì Hiện Tại Hoàn Thành Tiếp Diễn',
        category: 'tenses',
        level: 'intermediate',
        order: 4,
        sections: [
            {
                id: 'ppc-intro',
                heading: 'What is Present Perfect Continuous?',
                headingVi: 'Thì Hiện Tại Hoàn Thành Tiếp Diễn là gì?',
                content: 'Used to emphasize the duration of an action that started in the past and continues to now.',
                contentVi: 'Dùng để nhấn mạnh khoảng thời gian của hành động bắt đầu từ quá khứ và kéo dài đến hiện tại.',
                examples: [
                    { sentence: 'I **have been waiting** for 2 hours.', translation: 'Tôi đã đợi 2 tiếng rồi.', highlight: 'have been waiting' }
                ]
            }
        ],
        exercises: [
            { id: 'ppc-ex1', type: 'fill-blank', question: 'She ___ (study) all day.', answer: 'has been studying' }
        ]
    },
    {
        id: 'past-simple',
        title: 'Past Simple',
        titleVi: 'Thì Quá Khứ Đơn',
        category: 'tenses',
        level: 'beginner',
        order: 5,
        sections: [
            {
                id: 'pas-intro',
                heading: 'What is Past Simple?',
                headingVi: 'Thì Quá Khứ Đơn là gì?',
                content: 'The Past Simple is used for completed actions in the past.',
                contentVi: 'Thì Quá Khứ Đơn dùng cho hành động đã hoàn thành trong quá khứ.',
                examples: [
                    { sentence: 'I **visited** Paris last year.', translation: 'Tôi đã đến Paris năm ngoái.', highlight: 'visited' },
                    { sentence: 'She **didn\'t** go to school yesterday.', translation: 'Cô ấy không đi học hôm qua.', highlight: "didn't" }
                ]
            },
            {
                id: 'pas-form',
                heading: 'How to Form',
                headingVi: 'Cách chia',
                content: '**Positive:** Subject + V-ed / V2\n**Negative:** Subject + did not + V\n**Question:** Did + Subject + V?',
                contentVi: '**Khẳng định:** Chủ ngữ + V-ed / V2\n**Phủ định:** Chủ ngữ + did not + V\n**Nghi vấn:** Did + Chủ ngữ + V?',
                examples: [
                    { sentence: 'They **played** football yesterday.', translation: 'Họ đã chơi bóng đá hôm qua.', highlight: 'played' },
                    { sentence: '**Did** you see the movie?', translation: 'Bạn đã xem phim chưa?', highlight: 'Did' }
                ]
            }
        ],
        exercises: [
            { id: 'pas-ex1', type: 'fill-blank', question: 'She ___ (go) to the market yesterday.', answer: 'went' },
            { id: 'pas-ex2', type: 'choose', question: 'They ___ the exam last week.', answer: 'passed', options: ['pass', 'passed', 'passing', 'passes'] }
        ]
    },
    {
        id: 'past-continuous',
        title: 'Past Continuous',
        titleVi: 'Thì Quá Khứ Tiếp Diễn',
        category: 'tenses',
        level: 'lower-intermediate',
        order: 6,
        sections: [
            {
                id: 'pac-intro',
                heading: 'What is Past Continuous?',
                headingVi: 'Thì Quá Khứ Tiếp Diễn là gì?',
                content: 'The Past Continuous is used for actions in progress at a specific time in the past.',
                contentVi: 'Thì Quá Khứ Tiếp Diễn dùng cho hành động đang xảy ra tại một thời điểm cụ thể trong quá khứ.',
                examples: [
                    { sentence: 'I **was sleeping** when you called.', translation: 'Tôi đang ngủ khi bạn gọi.', highlight: 'was sleeping' }
                ]
            }
        ],
        exercises: [
            { id: 'pac-ex1', type: 'fill-blank', question: 'They ___ (watch) TV at 8pm last night.', answer: 'were watching' }
        ]
    },
    {
        id: 'past-perfect',
        title: 'Past Perfect',
        titleVi: 'Thì Quá Khứ Hoàn Thành',
        category: 'tenses',
        level: 'intermediate',
        order: 7,
        sections: [
            {
                id: 'pap-intro',
                heading: 'What is Past Perfect?',
                headingVi: 'Thì Quá Khứ Hoàn Thành là gì?',
                content: 'The Past Perfect is used for an action completed before another past action.',
                contentVi: 'Thì Quá Khứ Hoàn Thành dùng cho hành động hoàn thành trước một hành động khác trong quá khứ.',
                examples: [
                    { sentence: 'I **had finished** my homework before she arrived.', translation: 'Tôi đã làm xong bài tập trước khi cô ấy đến.', highlight: 'had finished' }
                ]
            }
        ],
        exercises: [
            { id: 'pap-ex1', type: 'fill-blank', question: 'By the time he came, I ___ (leave).', answer: 'had left' }
        ]
    },
    {
        id: 'past-perfect-continuous',
        title: 'Past Perfect Continuous',
        titleVi: 'Thì Quá Khứ Hoàn Thành Tiếp Diễn',
        category: 'tenses',
        level: 'upper-intermediate',
        order: 8,
        sections: [
            {
                id: 'papc-intro',
                heading: 'What is Past Perfect Continuous?',
                headingVi: 'Thì QKHTTTD là gì?',
                content: 'Used to show duration of an action before another past action.',
                contentVi: 'Dùng để nhấn mạnh khoảng thời gian của hành động trước một hành động khác trong quá khứ.',
                examples: [
                    { sentence: 'She **had been working** for 3 hours when I arrived.', translation: 'Cô ấy đã làm việc 3 tiếng khi tôi đến.', highlight: 'had been working' }
                ]
            }
        ],
        exercises: [
            { id: 'papc-ex1', type: 'fill-blank', question: 'They ___ (wait) for an hour before the bus came.', answer: 'had been waiting' }
        ]
    },
    {
        id: 'future-simple',
        title: 'Future Simple (will)',
        titleVi: 'Thì Tương Lai Đơn',
        category: 'tenses',
        level: 'beginner',
        order: 9,
        sections: [
            {
                id: 'fs-intro',
                heading: 'What is Future Simple?',
                headingVi: 'Thì Tương Lai Đơn là gì?',
                content: 'Future Simple with "will" is used for predictions, promises, and spontaneous decisions.',
                contentVi: 'Thì Tương Lai Đơn với "will" dùng cho dự đoán, lời hứa và quyết định tức thì.',
                examples: [
                    { sentence: 'I **will help** you.', translation: 'Tôi sẽ giúp bạn.', highlight: 'will help' },
                    { sentence: 'It **will rain** tomorrow.', translation: 'Ngày mai trời sẽ mưa.', highlight: 'will rain' }
                ]
            }
        ],
        exercises: [
            { id: 'fs-ex1', type: 'fill-blank', question: 'I think she ___ (come) tomorrow.', answer: 'will come' }
        ]
    },
    {
        id: 'future-going-to',
        title: 'Future (going to)',
        titleVi: 'Tương Lai Gần (be going to)',
        category: 'tenses',
        level: 'beginner',
        order: 10,
        sections: [
            {
                id: 'fg-intro',
                heading: 'What is "going to"?',
                headingVi: '"Be going to" là gì?',
                content: '"Going to" is used for planned intentions and predictions based on evidence.',
                contentVi: '"Be going to" dùng cho dự định đã lên kế hoạch và dự đoán dựa trên bằng chứng.',
                examples: [
                    { sentence: 'I **am going to** study abroad.', translation: 'Tôi sẽ đi du học.', highlight: 'am going to' },
                    { sentence: 'Look at the clouds! It **is going to** rain.', translation: 'Nhìn mây kìa! Trời sắp mưa.', highlight: 'is going to' }
                ]
            }
        ],
        exercises: [
            { id: 'fg-ex1', type: 'fill-blank', question: 'She ___ (visit) her grandma next week.', answer: 'is going to visit' }
        ]
    },
    {
        id: 'future-continuous',
        title: 'Future Continuous',
        titleVi: 'Thì Tương Lai Tiếp Diễn',
        category: 'tenses',
        level: 'intermediate',
        order: 11,
        sections: [
            {
                id: 'fc-intro',
                heading: 'What is Future Continuous?',
                headingVi: 'Thì Tương Lai Tiếp Diễn là gì?',
                content: 'Used for actions in progress at a specific time in the future.',
                contentVi: 'Dùng cho hành động đang diễn ra tại một thời điểm cụ thể trong tương lai.',
                examples: [
                    { sentence: 'I **will be working** at 9pm tonight.', translation: 'Tôi sẽ đang làm việc lúc 9 tối nay.', highlight: 'will be working' }
                ]
            }
        ],
        exercises: [
            { id: 'fc-ex1', type: 'fill-blank', question: 'This time tomorrow, I ___ (fly) to London.', answer: 'will be flying' }
        ]
    },
    {
        id: 'future-perfect',
        title: 'Future Perfect',
        titleVi: 'Thì Tương Lai Hoàn Thành',
        category: 'tenses',
        level: 'upper-intermediate',
        order: 12,
        sections: [
            {
                id: 'fp-intro',
                heading: 'What is Future Perfect?',
                headingVi: 'Thì Tương Lai Hoàn Thành là gì?',
                content: 'Used for actions that will be completed before a specific time in the future.',
                contentVi: 'Dùng cho hành động sẽ hoàn thành trước một thời điểm cụ thể trong tương lai.',
                examples: [
                    { sentence: 'By 2025, I **will have graduated**.', translation: 'Đến năm 2025, tôi sẽ tốt nghiệp rồi.', highlight: 'will have graduated' }
                ]
            }
        ],
        exercises: [
            { id: 'fp-ex1', type: 'fill-blank', question: 'By next month, she ___ (finish) the course.', answer: 'will have finished' }
        ]
    }
];

// ============================================
// SENTENCE STRUCTURES - 8 Topics
// ============================================

const STRUCTURES_LESSONS: GrammarLesson[] = [
    {
        id: 'passive-voice', title: 'Passive Voice', titleVi: 'Câu Bị Động', category: 'structures', level: 'intermediate', order: 13,
        sections: [
            {
                id: 'pv-intro', heading: 'What is Passive Voice?', headingVi: 'Câu bị động là gì?',
                content: 'Passive voice is used when the focus is on the action, not who performs it. Form: Subject + be + V3',
                contentVi: 'Câu bị động dùng khi muốn nhấn mạnh vào hành động. Công thức: S + be + V3',
                examples: [{ sentence: 'A letter **was written** by Tom.', translation: 'Một bức thư được viết bởi Tom.', highlight: 'was written' }]
            }
        ],
        exercises: [{ id: 'pv-ex1', type: 'transform', question: 'They built this house in 1990.', answer: 'This house was built in 1990.' }]
    },
    {
        id: 'conditional-sentences', title: 'Conditional Sentences', titleVi: 'Câu Điều Kiện', category: 'structures', level: 'intermediate', order: 14,
        sections: [
            {
                id: 'cs-type1', heading: 'Type 1: Real Possible', headingVi: 'Loại 1: Có thể xảy ra',
                content: 'If + Present Simple, will + V',
                contentVi: 'If + Hiện tại đơn, will + V',
                examples: [{ sentence: 'If it **rains**, I **will stay** home.', translation: 'Nếu trời mưa, tôi sẽ ở nhà.', highlight: 'rains...will stay' }]
            },
            {
                id: 'cs-type2', heading: 'Type 2: Unreal', headingVi: 'Loại 2: Không có thật',
                content: 'If + Past Simple, would + V',
                contentVi: 'If + Quá khứ đơn, would + V',
                examples: [{ sentence: 'If I **had** money, I **would travel**.', translation: 'Nếu tôi có tiền, tôi sẽ đi du lịch.', highlight: 'had...would travel' }]
            },
            {
                id: 'cs-type3', heading: 'Type 3: Past Impossible', headingVi: 'Loại 3: Quá khứ không thể',
                content: 'If + Past Perfect, would have + V3',
                contentVi: 'If + Quá khứ hoàn thành, would have + V3',
                examples: [{ sentence: 'If I **had studied**, I **would have passed**.', translation: 'Nếu tôi đã học, tôi đã đậu rồi.', highlight: 'had studied...would have passed' }]
            }
        ],
        exercises: [{ id: 'cs-ex1', type: 'fill-blank', question: 'If she ___ (study) harder, she will pass.', answer: 'studies' }]
    },
    {
        id: 'relative-clauses', title: 'Relative Clauses', titleVi: 'Mệnh Đề Quan Hệ', category: 'structures', level: 'lower-intermediate', order: 15,
        sections: [
            {
                id: 'rc-intro', heading: 'Relative Pronouns', headingVi: 'Đại từ quan hệ',
                content: '**who** - people, **which** - things, **that** - both, **whose** - possession, **where** - place',
                contentVi: '**who** - người, **which** - vật, **that** - cả hai, **whose** - sở hữu, **where** - nơi chốn',
                examples: [{ sentence: 'The man **who lives** next door is a doctor.', translation: 'Người đàn ông sống cạnh nhà là bác sĩ.', highlight: 'who lives' }]
            }
        ],
        exercises: [{ id: 'rc-ex1', type: 'fill-blank', question: 'The woman ___ called you is my aunt.', answer: 'who' }]
    },
    {
        id: 'reported-speech', title: 'Reported Speech', titleVi: 'Câu Gián Tiếp', category: 'structures', level: 'upper-intermediate', order: 16,
        sections: [
            {
                id: 'rs-intro', heading: 'Tense Changes', headingVi: 'Thay đổi thì',
                content: 'Present → Past, Past → Past Perfect, will → would',
                contentVi: 'Hiện tại → Quá khứ, Quá khứ → QKHT, will → would',
                examples: [{ sentence: '"I am tired." → She said she **was** tired.', translation: '"Tôi mệt." → Cô ấy nói cô ấy mệt.', highlight: 'was' }]
            }
        ],
        exercises: [{ id: 'rs-ex1', type: 'transform', question: '"I am happy." She said...', answer: 'She said she was happy.' }]
    },
    {
        id: 'question-tags', title: 'Question Tags', titleVi: 'Câu Hỏi Đuôi', category: 'structures', level: 'lower-intermediate', order: 17,
        sections: [
            {
                id: 'qt-intro', heading: 'How to Form', headingVi: 'Cách tạo',
                content: 'Positive statement → Negative tag, Negative statement → Positive tag',
                contentVi: 'Câu khẳng định → Tag phủ định, Câu phủ định → Tag khẳng định',
                examples: [{ sentence: 'You are a student, **aren\'t you**?', translation: 'Bạn là sinh viên, phải không?', highlight: "aren't you" }]
            }
        ],
        exercises: [{ id: 'qt-ex1', type: 'fill-blank', question: 'He is your brother, ___?', answer: "isn't he" }]
    },
    {
        id: 'indirect-questions', title: 'Indirect Questions', titleVi: 'Câu Hỏi Gián Tiếp', category: 'structures', level: 'intermediate', order: 18,
        sections: [
            {
                id: 'iq-intro', heading: 'Word Order', headingVi: 'Trật tự từ',
                content: 'No inversion in indirect questions. Use statement word order.',
                contentVi: 'Không đảo ngữ trong câu hỏi gián tiếp. Dùng trật tự câu trần thuật.',
                examples: [{ sentence: 'Could you tell me **where the station is**?', translation: 'Bạn có thể cho tôi biết nhà ga ở đâu không?', highlight: 'where the station is' }]
            }
        ],
        exercises: [{ id: 'iq-ex1', type: 'transform', question: 'What time is it? (Can you tell me...)', answer: 'Can you tell me what time it is?' }]
    },
    {
        id: 'comparatives-superlatives', title: 'Comparatives & Superlatives', titleVi: 'So Sánh Hơn & Nhất', category: 'structures', level: 'beginner', order: 19,
        sections: [
            {
                id: 'comp-intro', heading: 'Comparatives', headingVi: 'So sánh hơn',
                content: 'Short adj: adj + er. Long adj: more + adj.',
                contentVi: 'Tính từ ngắn: adj + er. Tính từ dài: more + adj.',
                examples: [{ sentence: 'She is **taller** than me.', translation: 'Cô ấy cao hơn tôi.', highlight: 'taller' }]
            }
        ],
        exercises: [{ id: 'comp-ex1', type: 'fill-blank', question: 'This is ___ (good) restaurant in town.', answer: 'the best' }]
    },
    {
        id: 'wish-if-only', title: 'Wish & If only', titleVi: 'Câu Ước', category: 'structures', level: 'upper-intermediate', order: 20,
        sections: [
            {
                id: 'wish-intro', heading: 'Wish for Present', headingVi: 'Ước cho hiện tại',
                content: 'I wish + Past Simple',
                contentVi: 'I wish + Quá khứ đơn',
                examples: [{ sentence: 'I wish I **had** more money.', translation: 'Ước gì tôi có nhiều tiền hơn.', highlight: 'had' }]
            }
        ],
        exercises: [{ id: 'wish-ex1', type: 'fill-blank', question: 'I wish I ___ (can) speak French.', answer: 'could' }]
    }
];

// ============================================
// VERBS - 6 Topics
// ============================================

const VERBS_LESSONS: GrammarLesson[] = [
    {
        id: 'modal-verbs', title: 'Modal Verbs', titleVi: 'Động Từ Khuyết Thiếu', category: 'verbs', level: 'intermediate', order: 21,
        sections: [
            {
                id: 'mv-intro', heading: 'Common Modals', headingVi: 'Các modal phổ biến',
                content: 'can/could (ability), must/have to (obligation), should (advice), may/might (possibility)',
                contentVi: 'can/could (khả năng), must/have to (bắt buộc), should (lời khuyên), may/might (khả năng)',
                examples: [{ sentence: 'You **should** study harder.', translation: 'Bạn nên học chăm hơn.', highlight: 'should' }]
            }
        ],
        exercises: [{ id: 'mv-ex1', type: 'choose', question: 'You ___ drive without a license.', answer: "mustn't", options: ['must', "mustn't", 'should', 'can'] }]
    },
    {
        id: 'gerunds-infinitives', title: 'Gerunds & Infinitives', titleVi: 'V-ing và To V', category: 'verbs', level: 'intermediate', order: 22,
        sections: [
            {
                id: 'gi-intro', heading: 'When to Use', headingVi: 'Khi nào dùng',
                content: 'Gerund (-ing): after certain verbs (enjoy, avoid, finish). Infinitive (to V): after certain verbs (want, decide, hope)',
                contentVi: 'V-ing: sau một số động từ (enjoy, avoid, finish). To V: sau một số động từ (want, decide, hope)',
                examples: [{ sentence: 'I enjoy **swimming**.', translation: 'Tôi thích bơi.', highlight: 'swimming' }]
            }
        ],
        exercises: [{ id: 'gi-ex1', type: 'fill-blank', question: 'She decided ___ (go) abroad.', answer: 'to go' }]
    },
    {
        id: 'phrasal-verbs', title: 'Phrasal Verbs', titleVi: 'Cụm Động Từ', category: 'verbs', level: 'intermediate', order: 23,
        sections: [
            {
                id: 'phr-intro', heading: 'What are Phrasal Verbs?', headingVi: 'Cụm động từ là gì?',
                content: 'Verb + preposition/adverb with a new meaning different from the original verb.',
                contentVi: 'Động từ + giới từ/trạng từ tạo nghĩa mới khác nghĩa gốc.',
                examples: [{ sentence: 'Please **turn off** the light.', translation: 'Làm ơn tắt đèn.', highlight: 'turn off' }]
            }
        ],
        exercises: [{ id: 'phr-ex1', type: 'fill-blank', question: 'I need to ___ ___ (look + for) my keys.', answer: 'look for' }]
    },
    {
        id: 'irregular-verbs', title: 'Irregular Verbs', titleVi: 'Động Từ Bất Quy Tắc', category: 'verbs', level: 'beginner', order: 24,
        sections: [
            {
                id: 'ir-intro', heading: 'Common Irregular Verbs', headingVi: 'Các động từ BQT phổ biến',
                content: 'go-went-gone, see-saw-seen, take-took-taken, be-was/were-been',
                contentVi: 'go-went-gone, see-saw-seen, take-took-taken, be-was/were-been',
                examples: [{ sentence: 'I **went** to school yesterday.', translation: 'Tôi đã đi học hôm qua.', highlight: 'went' }]
            }
        ],
        exercises: [{ id: 'ir-ex1', type: 'fill-blank', question: 'She ___ (buy) a new car last week.', answer: 'bought' }]
    },
    {
        id: 'causative-verbs', title: 'Causative Verbs', titleVi: 'Cấu Trúc Nhờ Vả', category: 'verbs', level: 'upper-intermediate', order: 25,
        sections: [
            {
                id: 'cv-intro', heading: 'Have/Get Something Done', headingVi: 'Nhờ ai làm gì',
                content: 'Have + object + V3 (someone does it for you)',
                contentVi: 'Have + tân ngữ + V3 (nhờ ai đó làm)',
                examples: [{ sentence: 'I **had my hair cut**.', translation: 'Tôi đã cắt tóc (nhờ người khác).', highlight: 'had my hair cut' }]
            }
        ],
        exercises: [{ id: 'cv-ex1', type: 'transform', question: 'Someone repaired my car. → I...', answer: 'I had my car repaired.' }]
    },
    {
        id: 'used-to', title: 'Used to / Would / Be used to', titleVi: 'Thói Quen', category: 'verbs', level: 'intermediate', order: 26,
        sections: [
            {
                id: 'ut-intro', heading: 'Differences', headingVi: 'Sự khác biệt',
                content: 'used to + V: past habit. be used to + V-ing: accustomed to',
                contentVi: 'used to + V: thói quen quá khứ. be used to + V-ing: quen với',
                examples: [{ sentence: 'I **used to smoke**.', translation: 'Tôi từng hút thuốc.', highlight: 'used to smoke' }]
            }
        ],
        exercises: [{ id: 'ut-ex1', type: 'fill-blank', question: 'I ___ (use) to live in Paris.', answer: 'used' }]
    }
];

// ============================================
// OTHERS - 4 Topics
// ============================================

const OTHERS_LESSONS: GrammarLesson[] = [
    {
        id: 'articles', title: 'Articles', titleVi: 'Mạo Từ', category: 'others', level: 'beginner', order: 27,
        sections: [
            {
                id: 'art-intro', heading: 'A, An, The', headingVi: 'A, An, The',
                content: 'a/an: indefinite (first mention). the: definite (known/specific)',
                contentVi: 'a/an: không xác định (lần đầu nhắc). the: xác định (đã biết/cụ thể)',
                examples: [{ sentence: 'I saw **a** cat. **The** cat was black.', translation: 'Tôi thấy một con mèo. Con mèo đó màu đen.', highlight: 'a...The' }]
            }
        ],
        exercises: [{ id: 'art-ex1', type: 'fill-blank', question: 'She is ___ engineer.', answer: 'an' }]
    },
    {
        id: 'prepositions', title: 'Prepositions', titleVi: 'Giới Từ', category: 'others', level: 'beginner', order: 28,
        sections: [
            {
                id: 'prep-intro', heading: 'Time & Place', headingVi: 'Thời gian & Nơi chốn',
                content: 'at (point), in (enclosed), on (surface). Time: at 7pm, on Monday, in June',
                contentVi: 'at (điểm), in (bên trong), on (bề mặt). Thời gian: at 7pm, on Monday, in June',
                examples: [{ sentence: 'I live **in** Vietnam.', translation: 'Tôi sống ở Việt Nam.', highlight: 'in' }]
            }
        ],
        exercises: [{ id: 'prep-ex1', type: 'fill-blank', question: 'The meeting is ___ Monday.', answer: 'on' }]
    },
    {
        id: 'quantifiers', title: 'Quantifiers', titleVi: 'Lượng Từ', category: 'others', level: 'lower-intermediate', order: 29,
        sections: [
            {
                id: 'qu-intro', heading: 'Some, Any, Much, Many', headingVi: 'Some, Any, Much, Many',
                content: 'some: affirmative. any: negative/question. much: uncountable. many: countable',
                contentVi: 'some: khẳng định. any: phủ định/nghi vấn. much: không đếm được. many: đếm được',
                examples: [{ sentence: 'I don\'t have **any** money.', translation: 'Tôi không có tiền.', highlight: 'any' }]
            }
        ],
        exercises: [{ id: 'qu-ex1', type: 'fill-blank', question: 'There isn\'t ___ water left.', answer: 'much' }]
    },
    {
        id: 'word-order', title: 'Word Order', titleVi: 'Trật Tự Từ', category: 'others', level: 'beginner', order: 30,
        sections: [
            {
                id: 'wo-intro', heading: 'Basic Order', headingVi: 'Trật tự cơ bản',
                content: 'Subject + Verb + Object + Manner + Place + Time (SVO MPT)',
                contentVi: 'Chủ ngữ + Động từ + Tân ngữ + Cách thức + Nơi chốn + Thời gian',
                examples: [{ sentence: 'I study English **carefully** **at home** **every day**.', translation: 'Tôi học tiếng Anh cẩn thận ở nhà mỗi ngày.', highlight: 'carefully at home every day' }]
            }
        ],
        exercises: [{ id: 'wo-ex1', type: 'choose', question: 'Which order is correct?', answer: 'She speaks English fluently.', options: ['She speaks fluently English.', 'She speaks English fluently.', 'She fluently speaks English.'] }]
    }
];

// Export all lessons
export const GRAMMAR_LESSONS: GrammarLesson[] = [
    ...TENSES_LESSONS,
    ...STRUCTURES_LESSONS,
    ...VERBS_LESSONS,
    ...OTHERS_LESSONS
];

// Helper functions
export const getGrammarByCategory = (category: GrammarLesson['category']) =>
    GRAMMAR_LESSONS.filter(l => l.category === category);

export const getGrammarById = (id: string) =>
    GRAMMAR_LESSONS.find(l => l.id === id);

