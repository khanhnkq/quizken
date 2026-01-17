
export interface QuizQuestion {
    id: string;
    type: 'fill-blank' | 'choose' | 'transform'; // Simplified types
    question: string;
    answer: string;
    options?: string[]; // Only for 'choose'
    explanation?: string;
}

export const GRAMMAR_QUIZ_DATA: Record<string, QuizQuestion[]> = {
    // 1. Present Simple
    'present-simple': [
        { id: 'ps-1', type: 'fill-blank', question: 'She ___ (work) in a bank.', answer: 'works', explanation: 'She + V-s/es' },
        { id: 'ps-2', type: 'choose', question: '___ you like chocolate?', answer: 'Do', options: ['Do', 'Does', 'Is', 'Are'] },
        { id: 'ps-3', type: 'fill-blank', question: 'The sun ___ (rise) in the east.', answer: 'rises', explanation: 'General truth' },
        { id: 'ps-4', type: 'choose', question: 'He ___ football every weekend.', answer: 'plays', options: ['play', 'playing', 'plays', 'played'] },
        { id: 'ps-5', type: 'fill-blank', question: 'We ___ (not/watch) TV in the morning.', answer: "don't watch", explanation: 'We + do not + V' },
        { id: 'ps-6', type: 'choose', question: '___ she speak French?', answer: 'Does', options: ['Do', 'Does', 'Is', 'Has'] },
        { id: 'ps-7', type: 'fill-blank', question: 'My train ___ (leave) at 9 PM.', answer: 'leaves', explanation: 'Schedule/Timetable' },
        { id: 'ps-8', type: 'choose', question: 'I ___ usually go to bed late.', answer: "don't", options: ["doesn't", "don't", "not", "am not"] },
        { id: 'ps-9', type: 'fill-blank', question: 'Water ___ (boil) at 100 degrees.', answer: 'boils', explanation: 'Scientific fact' },
        { id: 'ps-10', type: 'choose', question: 'Where ___ John live?', answer: 'does', options: ['do', 'does', 'is', 'are'] }
    ],
    // 2. Present Continuous
    'present-continuous': [
        { id: 'pc-1', type: 'fill-blank', question: 'Look! It ___ (rain).', answer: 'is raining', explanation: 'Happening now' },
        { id: 'pc-2', type: 'choose', question: 'We ___ dinner at the moment.', answer: 'are having', options: ['have', 'having', 'are having', 'had'] },
        { id: 'pc-3', type: 'fill-blank', question: 'She ___ (not/listen) to music.', answer: "isn't listening", explanation: 'Negative continuous' },
        { id: 'pc-4', type: 'choose', question: 'Why ___ you crying?', answer: 'are', options: ['do', 'are', 'is', 'have'] },
        { id: 'pc-5', type: 'fill-blank', question: 'I ___ (study) for my exam right now.', answer: 'am studying', explanation: 'Action in progress' },
        { id: 'pc-6', type: 'choose', question: 'He ___ a blue shirt today.', answer: 'is wearing', options: ['wears', 'wear', 'is wearing', 'wearing'] },
        { id: 'pc-7', type: 'fill-blank', question: 'They ___ (build) a new house down the street.', answer: 'are building', explanation: 'Temporary ongoing action' },
        { id: 'pc-8', type: 'choose', question: '___ they coming to the party?', answer: 'Are', options: ['Do', 'Are', 'Is', 'Have'] },
        { id: 'pc-9', type: 'fill-blank', question: 'The baby ___ (sleep), please be quiet.', answer: 'is sleeping', explanation: 'Happening now' },
        { id: 'pc-10', type: 'choose', question: 'I ___ reading a very interesting book.', answer: 'am', options: ['is', 'am', 'are', 'do'] }
    ],
    // 3. Present Perfect
    'present-perfect': [
        { id: 'pp-1', type: 'fill-blank', question: 'I ___ (live) here for ten years.', answer: 'have lived', explanation: 'Started in past, continues to now' },
        { id: 'pp-2', type: 'choose', question: 'She ___ just finished her homework.', answer: 'has', options: ['have', 'has', 'is', 'did'] },
        { id: 'pp-3', type: 'fill-blank', question: 'We ___ (not/see) that movie yet.', answer: "haven't seen", explanation: 'Negative perfect' },
        { id: 'pp-4', type: 'choose', question: 'Have you ever ___ to Japan?', answer: 'been', options: ['go', 'gone', 'been', 'went'] },
        { id: 'pp-5', type: 'fill-blank', question: 'He ___ (lose) his keys.', answer: 'has lost', explanation: 'Result in present' },
        { id: 'pp-6', type: 'choose', question: 'I have known him ___ 2010.', answer: 'since', options: ['for', 'since', 'in', 'at'] },
        { id: 'pp-7', type: 'fill-blank', question: 'How long ___ (you/be) married?', answer: 'have you been', explanation: 'Duration until now' },
        { id: 'pp-8', type: 'choose', question: 'They have ___ bought a new car.', answer: 'already', options: ['yet', 'already', 'since', 'ever'] },
        { id: 'pp-9', type: 'fill-blank', question: 'She ___ (never/eat) sushi.', answer: 'has never eaten', explanation: 'Experience' },
        { id: 'pp-10', type: 'choose', question: 'We have lived here ___ five years.', answer: 'for', options: ['since', 'for', 'during', 'in'] }
    ],
    // 4. Past Simple
    'past-simple': [
        { id: 'pas-1', type: 'fill-blank', question: 'I ___ (watch) a movie yesterday.', answer: 'watched', explanation: 'Completed action in past' },
        { id: 'pas-2', type: 'choose', question: 'Did you ___ to school yesterday?', answer: 'go', options: ['go', 'went', 'gone', 'going'] },
        { id: 'pas-3', type: 'fill-blank', question: 'He ___ (not/buy) anything.', answer: "didn't buy", explanation: 'Negative past' },
        { id: 'pas-4', type: 'choose', question: 'Where ___ you born?', answer: 'were', options: ['was', 'were', 'did', 'are'] },
        { id: 'pas-5', type: 'fill-blank', question: 'They ___ (leave) two hours ago.', answer: 'left', explanation: 'Irregular verb' },
        { id: 'pas-6', type: 'choose', question: 'When ___ he arrive?', answer: 'did', options: ['do', 'did', 'was', 'were'] },
        { id: 'pas-7', type: 'fill-blank', question: 'We ___ (be) very tired last night.', answer: 'were', explanation: 'To be in past' },
        { id: 'pas-8', type: 'choose', question: 'I ___ see him at the party.', answer: "didn't", options: ["didn't", "don't", "wasn't", "not"] },
        { id: 'pas-9', type: 'fill-blank', question: 'She ___ (write) an email to her boss.', answer: 'wrote', explanation: 'Irregular verb' },
        { id: 'pas-10', type: 'choose', question: '___ you happy with the result?', answer: 'Were', options: ['Did', 'Was', 'Were', 'Are'] }
    ],
    // 5. Future Simple
    'future-simple': [
        { id: 'fs-1', type: 'fill-blank', question: 'I think it ___ (rain) tomorrow.', answer: 'will rain', explanation: 'Prediction' },
        { id: 'fs-2', type: 'choose', question: 'I ___ help you with your homework.', answer: 'will', options: ['am', 'will', 'going to', 'want'] },
        { id: 'fs-3', type: 'fill-blank', question: 'I promise I ___ (not/tell) anyone.', answer: "won't tell", explanation: 'Promise' },
        { id: 'fs-4', type: 'choose', question: '___ you open the window, please?', answer: 'Will', options: ['Do', 'Will', 'Are', 'Have'] },
        { id: 'fs-5', type: 'fill-blank', question: 'Wait! I ___ (get) it for you.', answer: 'will get', explanation: 'Instant decision' },
        { id: 'fs-6', type: 'choose', question: 'We ___ probably arrive late.', answer: 'will', options: ['are', 'will', 'going to', 'do'] },
        { id: 'fs-7', type: 'fill-blank', question: 'She ___ (be) 20 next month.', answer: 'will be', explanation: 'Future fact' },
        { id: 'fs-8', type: 'choose', question: 'I don\'t think he ___ pass the exam.', answer: 'will', options: ['does', 'will', 'is', 'has'] },
        { id: 'fs-9', type: 'fill-blank', question: 'If you ask her, she ___ (help) you.', answer: 'will help', explanation: 'First conditional' },
        { id: 'fs-10', type: 'choose', question: 'I ___ call you when I get home.', answer: 'will', options: ['am', 'will', 'do', 'have'] }
    ],
    // 6. Passive Voice
    'passive-voice': [
        { id: 'pv-1', type: 'choose', question: 'The letter ___ yesterday.', answer: 'was sent', options: ['sent', 'was sent', 'is sent', 'has sent'] },
        { id: 'pv-2', type: 'fill-blank', question: 'This house ___ (build) in 1990.', answer: 'was built', explanation: 'Past simple passive' },
        { id: 'pv-3', type: 'choose', question: 'English ___ all over the world.', answer: 'is spoken', options: ['speaks', 'is spoken', 'spoke', 'was spoken'] },
        { id: 'pv-4', type: 'fill-blank', question: 'The room ___ (clean) every day.', answer: 'is cleaned', explanation: 'Present simple passive' },
        { id: 'pv-5', type: 'choose', question: 'The car ___ repaired right now.', answer: 'is being', options: ['is', 'is being', 'has been', 'was'] },
        { id: 'pv-6', type: 'fill-blank', question: 'My bike ___ (steal) last night.', answer: 'was stolen', explanation: 'Past simple passive' },
        { id: 'pv-7', type: 'choose', question: 'The decision will ___ made tomorrow.', answer: 'be', options: ['been', 'be', 'being', 'is'] },
        { id: 'pv-8', type: 'fill-blank', question: 'The homework must ___ (do) by Friday.', answer: 'be done', explanation: 'Modal passive' },
        { id: 'pv-9', type: 'choose', question: 'Penicillin ___ discovered by Fleming.', answer: 'was', options: ['is', 'was', 'were', 'has been'] },
        { id: 'pv-10', type: 'fill-blank', question: 'We ___ (invite) to the party yet.', answer: "haven't been invited", explanation: 'Present perfect passive' }
    ],
    // 7. Conditionals
    'conditionals': [
        { id: 'cond-1', type: 'choose', question: 'If it rains, I ___ at home.', answer: 'will stay', options: ['stay', 'will stay', 'stayed', 'would stay'] },
        { id: 'cond-2', type: 'fill-blank', question: 'If I ___ (be) you, I would study harder.', answer: 'were', explanation: 'Second conditional' },
        { id: 'cond-3', type: 'choose', question: 'Water boils if you ___ it to 100°C.', answer: 'heat', options: ['heat', 'will heat', 'heated', 'heating'] },
        { id: 'cond-4', type: 'fill-blank', question: 'If he ___ (call), tell him I am busy.', answer: 'calls', explanation: 'First conditional' },
        { id: 'cond-5', type: 'choose', question: 'I would buy a car if I ___ enough money.', answer: 'had', options: ['have', 'had', 'have had', 'will have'] },
        { id: 'cond-6', type: 'fill-blank', question: 'If I had known, I ___ (help) you.', answer: 'would have helped', explanation: 'Third conditional' },
        { id: 'cond-7', type: 'choose', question: 'Unless you hurry, you ___ miss the bus.', answer: 'will', options: ['don\'t', 'won\'t', 'will', 'would'] },
        { id: 'cond-8', type: 'fill-blank', question: 'What would you do if you ___ (win) the lottery?', answer: 'won', explanation: 'Second conditional' },
        { id: 'cond-9', type: 'choose', question: 'If she ___ harder, she would have passed.', answer: 'had studied', options: ['studied', 'has studied', 'had studied', 'studies'] },
        { id: 'cond-10', type: 'fill-blank', question: 'When ice melts, it ___ (become) water.', answer: 'becomes', explanation: 'Zero conditional' }
    ],
    // 8. Relative Clauses
    'relative-clauses': [
        { id: 'rc-1', type: 'choose', question: 'This is the boy ___ kicked the ball.', answer: 'who', options: ['who', 'which', 'whose', 'whom'] },
        { id: 'rc-2', type: 'fill-blank', question: 'The book ___ is on the table is mine.', answer: 'which', explanation: 'Thing' },
        { id: 'rc-3', type: 'choose', question: 'I know a place ___ we can eat.', answer: 'where', options: ['which', 'where', 'when', 'that'] },
        { id: 'rc-4', type: 'fill-blank', question: 'The woman ___ (daughter) goes to school with me is a doctor.', answer: 'whose daughter', explanation: 'Possession' },
        { id: 'rc-5', type: 'choose', question: '1990 was the year ___ I was born.', answer: 'when', options: ['where', 'when', 'which', 'why'] },
        { id: 'rc-6', type: 'fill-blank', question: 'That is the car ___ I want to buy.', answer: 'that', explanation: 'Thing' },
        { id: 'rc-7', type: 'choose', question: 'The man ___ I met yesterday was nice.', answer: 'whom', options: ['which', 'whose', 'whom', 'where'] },
        { id: 'rc-8', type: 'fill-blank', question: 'Do you know the reason ___ she left?', answer: 'why', explanation: 'Reason' },
        { id: 'rc-9', type: 'choose', question: 'The cake ___ Mary made is delicious.', answer: 'which', options: ['who', 'whose', 'where', 'which'] },
        { id: 'rc-10', type: 'fill-blank', question: 'My brother, ___ lives in NY, is coming.', answer: 'who', explanation: 'Person (Non-defining)' }
    ],
    // 9. Articles
    'articles': [
        { id: 'art-1', type: 'choose', question: 'I saw ___ bird in the tree.', answer: 'a', options: ['a', 'an', 'the', '-'] },
        { id: 'art-2', type: 'fill-blank', question: '___ sun rises in the east.', answer: 'The', explanation: 'Unique object' },
        { id: 'art-3', type: 'choose', question: 'She is ___ honest person.', answer: 'an', options: ['a', 'an', 'the', '-'] },
        { id: 'art-4', type: 'fill-blank', question: 'I love ___ (no article) chocolate.', answer: '-', explanation: 'General noun' },
        { id: 'art-5', type: 'choose', question: 'Can you play ___ guitar?', answer: 'the', options: ['a', 'an', 'the', '-'] },
        { id: 'art-6', type: 'fill-blank', question: 'He goes to work by ___ bus.', answer: '-', explanation: 'Transport' },
        { id: 'art-7', type: 'choose', question: 'I want to be ___ doctor.', answer: 'a', options: ['a', 'an', 'the', '-'] },
        { id: 'art-8', type: 'fill-blank', question: 'Paris is ___ capital of France.', answer: 'the', explanation: 'Specific' },
        { id: 'art-9', type: 'choose', question: '___ Everest is the highest mountain.', answer: '-', options: ['The', 'A', '-', 'An'] },
        { id: 'art-10', type: 'fill-blank', question: 'Have ___ nice day!', answer: 'a', explanation: 'Singular countable' }
    ],
    // 10. Prepositions
    'prepositions': [
        { id: 'prep-1', type: 'choose', question: 'The book is ___ the table.', answer: 'on', options: ['in', 'on', 'at', 'with'] },
        { id: 'prep-2', type: 'fill-blank', question: 'She was born ___ May.', answer: 'in', explanation: 'Month' },
        { id: 'prep-3', type: 'choose', question: 'I will see you ___ 5 PM.', answer: 'at', options: ['in', 'on', 'at', 'for'] },
        { id: 'prep-4', type: 'fill-blank', question: 'He is interested ___ learning English.', answer: 'in', explanation: 'Adjective + Prep' },
        { id: 'prep-5', type: 'choose', question: 'We go to school ___ Mondays.', answer: 'on', options: ['in', 'on', 'at', 'by'] },
        { id: 'prep-6', type: 'fill-blank', question: 'The cat is hiding ___ the bed.', answer: 'under', explanation: 'Position' },
        { id: 'prep-7', type: 'choose', question: 'She is afraid ___ spiders.', answer: 'of', options: ['with', 'of', 'at', 'in'] },
        { id: 'prep-8', type: 'fill-blank', question: 'I am waiting ___ the bus.', answer: 'for', explanation: 'Wait for' },
        { id: 'prep-9', type: 'choose', question: 'He walked ___ the room.', answer: 'into', options: ['in', 'into', 'at', 'on'] },
        { id: 'prep-10', type: 'fill-blank', question: 'This gift is ___ you.', answer: 'for', explanation: 'Recipient' }
    ],
    // 11. Present Perfect Continuous (Moved to correct key)
    'present-perfect-cont': [
        { id: 'ppc-1', type: 'choose', question: 'I have ___ waiting for 2 hours.', answer: 'been', options: ['be', 'been', 'being', 'was'] },
        { id: 'ppc-2', type: 'fill-blank', question: 'It ___ (rain) all day.', answer: 'has been raining', explanation: 'Continuous duration' },
        { id: 'ppc-3', type: 'choose', question: 'She has been ___ since morning.', answer: 'working', options: ['work', 'worked', 'working', 'works'] },
        { id: 'ppc-4', type: 'fill-blank', question: 'How long ___ (you/learn) English?', answer: 'have you been learning', explanation: 'Continuous duration' },
        { id: 'ppc-5', type: 'choose', question: 'They ___ been playing football.', answer: 'have', options: ['has', 'have', 'are', 'had'] },
        { id: 'ppc-6', type: 'fill-blank', question: 'My eyes are red because I ___ (cry).', answer: 'have been crying', explanation: 'Recent activity result' },
        { id: 'ppc-7', type: 'choose', question: 'He has been ___ to call you.', answer: 'trying', options: ['tried', 'try', 'trying', 'tries'] },
        { id: 'ppc-8', type: 'fill-blank', question: 'We ___ (wait) here since 8 AM.', answer: 'have been waiting', explanation: 'Continuous duration' },
        { id: 'ppc-9', type: 'choose', question: 'You look tired. ___ you been running?', answer: 'Have', options: ['Has', 'Have', 'Did', 'Do'] },
        { id: 'ppc-10', type: 'fill-blank', question: 'She ___ (cook) for 3 hours.', answer: 'has been cooking', explanation: 'Duration' }
    ],
    // 12. Past Continuous
    'past-continuous': [
        { id: 'pc2-1', type: 'choose', question: 'I ___ sleeping when you called.', answer: 'was', options: ['was', 'were', 'am', 'is'] },
        { id: 'pc2-2', type: 'fill-blank', question: 'They ___ (watch) TV at 8 PM yesterday.', answer: 'were watching', explanation: 'Past action in progress' },
        { id: 'pc2-3', type: 'choose', question: 'What ___ you doing at this time yesterday?', answer: 'were', options: ['was', 'were', 'did', 'do'] },
        { id: 'pc2-4', type: 'fill-blank', question: 'While I ___ (walk), I saw an accident.', answer: 'was walking', explanation: 'Action interrupted' },
        { id: 'pc2-5', type: 'choose', question: 'She was ___ dinner when he arrived.', answer: 'cooking', options: ['cook', 'cooked', 'cooking', 'cooks'] },
        { id: 'pc2-6', type: 'fill-blank', question: 'It ___ (rain) heavily last night.', answer: 'was raining', explanation: 'Background action' },
        { id: 'pc2-7', type: 'choose', question: 'We ___ playing games all evening.', answer: 'were', options: ['was', 'were', 'did', 'had'] },
        { id: 'pc2-8', type: 'fill-blank', question: 'He ___ (not/sleep) when I came in.', answer: "wasn't sleeping", explanation: 'Negative past continuous' },
        { id: 'pc2-9', type: 'choose', question: '___ she studying?', answer: 'Was', options: ['Were', 'Was', 'Did', 'Does'] },
        { id: 'pc2-10', type: 'fill-blank', question: 'They ___ (talk) loudly in the library.', answer: 'were talking', explanation: 'Annoying habit in past context or action' }
    ],
    // 13. Past Perfect
    'past-perfect': [
        { id: 'pp2-1', type: 'choose', question: 'When I arrived, the train ___ already left.', answer: 'had', options: ['have', 'has', 'had', 'was'] },
        { id: 'pp2-2', type: 'fill-blank', question: 'She realized she ___ (lose) her bag.', answer: 'had lost', explanation: 'Action before past action' },
        { id: 'pp2-3', type: 'choose', question: 'I ___ never seen such a beautiful view.', answer: 'had', options: ['have', 'had', 'was', 'did'] },
        { id: 'pp2-4', type: 'fill-blank', question: 'He was hungry because he ___ (not/eat).', answer: "hadn't eaten", explanation: 'Reason in past' },
        { id: 'pp2-5', type: 'choose', question: '___ you finished the work before he came?', answer: 'Had', options: ['Have', 'Had', 'Did', 'Were'] },
        { id: 'pp2-6', type: 'fill-blank', question: 'By the time we got there, the movie ___ (start).', answer: 'had started', explanation: 'Action before time' },
        { id: 'pp2-7', type: 'choose', question: 'She told me she ___ visited Paris.', answer: 'had', options: ['has', 'had', 'was', 'is'] },
        { id: 'pp2-8', type: 'fill-blank', question: 'I ___ (live) there for years before moving.', answer: 'had lived', explanation: 'Duration before past' },
        { id: 'pp2-9', type: 'choose', question: 'If I ___ known, I would have told you.', answer: 'had', options: ['have', 'had', 'did', 'was'] },
        { id: 'pp2-10', type: 'fill-blank', question: 'They ___ (prepare) everything before the guests arrived.', answer: 'had prepared', explanation: 'Preparation before event' }
    ],
    // 14. Past Perfect Continuous
    'past-perfect-cont': [
        { id: 'ppc2-1', type: 'choose', question: 'I had been ___ for two hours.', answer: 'waiting', options: ['wait', 'waited', 'waiting', 'waits'] },
        { id: 'ppc2-2', type: 'fill-blank', question: 'The ground was wet. It ___ (rain).', answer: 'had been raining', explanation: 'Evidence in past' },
        { id: 'ppc2-3', type: 'choose', question: 'She ___ been working all day.', answer: 'had', options: ['has', 'have', 'had', 'was'] },
        { id: 'ppc2-4', type: 'fill-blank', question: 'He was tired because he ___ (run).', answer: 'had been running', explanation: 'Cause of past state' },
        { id: 'ppc2-5', type: 'choose', question: '___ you been waiting long?', answer: 'Had', options: ['Have', 'Had', 'Did', 'Were'] },
        { id: 'ppc2-6', type: 'fill-blank', question: 'They ___ (play) since morning when mom called.', answer: 'had been playing', explanation: 'Duration before past action' },
        { id: 'ppc2-7', type: 'choose', question: 'We had been ___ English for 3 years.', answer: 'learning', options: ['learn', 'learnt', 'learning', 'learns'] },
        { id: 'ppc2-8', type: 'fill-blank', question: 'She ___ (cry) before she fell asleep.', answer: 'had been crying', explanation: 'Action leading to event' },
        { id: 'ppc2-9', type: 'choose', question: 'How long had you ___ living there?', answer: 'been', options: ['be', 'been', 'being', 'was'] },
        { id: 'ppc2-10', type: 'fill-blank', question: 'The car ___ (make) strange noises before it broke down.', answer: 'had been making', explanation: 'Recent past continuous action' }
    ],
    // 15. Future Going To
    'future-going-to': [
        { id: 'fgt-1', type: 'choose', question: 'Look at the clouds! It ___ rain.', answer: 'is going to', options: ['will', 'is going to', 'shall', 'would'] },
        { id: 'fgt-2', type: 'fill-blank', question: 'I ___ (visit) my grandma next week.', answer: 'am going to visit', explanation: 'Plan' },
        { id: 'fgt-3', type: 'choose', question: '___ you going to buy that car?', answer: 'Are', options: ['Do', 'Will', 'Are', 'Have'] },
        { id: 'fgt-4', type: 'fill-blank', question: 'She ___ (have) a baby soon.', answer: 'is going to have', explanation: 'Evidence/Near future' },
        { id: 'fgt-5', type: 'choose', question: 'We are ___ to travel to Japan.', answer: 'going', options: ['go', 'going', 'gone', 'will'] },
        { id: 'fgt-6', type: 'fill-blank', question: 'They ___ (build) a new school here.', answer: 'are going to build', explanation: 'Plan' },
        { id: 'fgt-7', type: 'choose', question: 'I am ___ study medicine.', answer: 'going to', options: ['will', 'going to', 'go to', 'gonna'] },
        { id: 'fgt-8', type: 'fill-blank', question: 'Watch out! You ___ (fall).', answer: 'are going to fall', explanation: 'Immediate danger' },
        { id: 'fgt-9', type: 'choose', question: 'What ___ you going to do?', answer: 'are', options: ['do', 'will', 'are', 'have'] },
        { id: 'fgt-10', type: 'fill-blank', question: 'He ___ (not/come) to the party.', answer: "isn't going to come", explanation: 'Plan (negative)' }
    ],
    // 16. Future Continuous
    'future-continuous': [
        { id: 'fc-1', type: 'choose', question: 'At 8 PM, I will ___ watching TV.', answer: 'be', options: ['be', 'been', 'am', 'is'] },
        { id: 'fc-2', type: 'fill-blank', question: 'This time tomorrow, we ___ (fly) to Paris.', answer: 'will be flying', explanation: 'Action in progress in future' },
        { id: 'fc-3', type: 'choose', question: 'She will be ___ when you arrive.', answer: 'sleeping', options: ['sleep', 'slept', 'sleeping', 'sleeps'] },
        { id: 'fc-4', type: 'fill-blank', question: 'I ___ (work) all weekend.', answer: 'will be working', explanation: 'Usage' },
        { id: 'fc-5', type: 'choose', question: 'Will you ___ using the car?', answer: 'be', options: ['are', 'will', 'be', 'have'] },
        { id: 'fc-6', type: 'fill-blank', question: 'They ___ (play) tennis at 10 AM.', answer: 'will be playing', explanation: 'Future scheduled action' },
        { id: 'fc-7', type: 'choose', question: 'I ___ be waiting for you.', answer: 'will', options: ['am', 'will', 'do', 'have'] },
        { id: 'fc-8', type: 'fill-blank', question: 'Don\'t call him. He ___ (study).', answer: 'will be studying', explanation: 'Prediction/Expectation' },
        { id: 'fc-9', type: 'choose', question: 'We will be ___ dinner soon.', answer: 'having', options: ['have', 'had', 'having', 'has'] },
        { id: 'fc-10', type: 'fill-blank', question: 'Who ___ (you/meet) tomorrow?', answer: 'will you be meeting', explanation: 'Future arrangement' }
    ],
    // 17. Future Perfect
    'future-perfect': [
        { id: 'fp-1', type: 'choose', question: 'By 2025, I will ___ graduated.', answer: 'have', options: ['has', 'have', 'had', 'be'] },
        { id: 'fp-2', type: 'fill-blank', question: 'She ___ (finish) the report by 5 PM.', answer: 'will have finished', explanation: 'Completed before future time' },
        { id: 'fp-3', type: 'choose', question: 'We will have ___ dinner by the time you come.', answer: 'eaten', options: ['eat', 'ate', 'eaten', 'eating'] },
        { id: 'fp-4', type: 'fill-blank', question: 'They ___ (leave) before you arrive.', answer: 'will have left', explanation: 'Action before future event' },
        { id: 'fp-5', type: 'choose', question: '___ you have finished it by Monday?', answer: 'Will', options: ['Do', 'Are', 'Will', 'Have'] },
        { id: 'fp-6', type: 'fill-blank', question: 'I ___ (read) the whole book by tomorrow.', answer: 'will have read', explanation: 'Completion prediction' },
        { id: 'fp-7', type: 'choose', question: 'He ___ not have arrived yet.', answer: 'will', options: ['is', 'does', 'will', 'has'] },
        { id: 'fp-8', type: 'fill-blank', question: 'We ___ (live) here for 10 years next month.', answer: 'will have lived', explanation: 'Duration at future point' },
        { id: 'fp-9', type: 'choose', question: 'The train will have ___ by now.', answer: 'departed', options: ['depart', 'departed', 'departs', 'departing'] },
        { id: 'fp-10', type: 'fill-blank', question: 'How many countries ___ (you/visit) by next year?', answer: 'will you have visited', explanation: 'Question form' }
    ],
    // 18. Reported Speech
    'reported-speech': [
        { id: 'rs-1', type: 'choose', question: 'He said he ___ busy.', answer: 'was', options: ['is', 'was', 'were', 'has been'] },
        { id: 'rs-2', type: 'fill-blank', question: 'She told me ___ (wait) for her.', answer: 'to wait', explanation: 'Imperative to infinitive' },
        { id: 'rs-3', type: 'choose', question: 'They asked where I ___ living.', answer: 'was', options: ['am', 'was', 'were', 'is'] },
        { id: 'rs-4', type: 'fill-blank', question: 'He said he ___ (buy) a new car.', answer: 'had bought', explanation: 'Past simple to past perfect or Past to Past' },
        { id: 'rs-5', type: 'choose', question: 'She asked ___ I liked coffee.', answer: 'if', options: ['that', 'if', 'what', 'which'] },
        { id: 'rs-6', type: 'fill-blank', question: 'The teacher said: "Open your books". -> The teacher told us ___ (open) our books.', answer: 'to open', explanation: 'Command' },
        { id: 'rs-7', type: 'choose', question: 'He said he ___ call me tomorrow.', answer: 'would', options: ['will', 'would', 'can', 'may'] },
        { id: 'rs-8', type: 'fill-blank', question: '"I am happy". -> He said he ___ (be) happy.', answer: 'was', explanation: 'Present to past' },
        { id: 'rs-9', type: 'choose', question: 'She asked me what my name ___.', answer: 'was', options: ['is', 'was', 'were', 'be'] },
        { id: 'rs-10', type: 'fill-blank', question: 'He told me not ___ (touch) it.', answer: 'to touch', explanation: 'Negative command' }
    ],
    // 19. Question Tags
    'question-tags': [
        { id: 'qt-1', type: 'choose', question: 'It is cold, ___ it?', answer: "isn't", options: ["is", "isn't", "was", "wasn't"] },
        { id: 'qt-2', type: 'fill-blank', question: 'You play football, ___ you?', answer: "don't", explanation: 'Present simple tag' },
        { id: 'qt-3', type: 'choose', question: 'She has a car, ___ she?', answer: "doesn't", options: ["don't", "doesn't", "hasn't", "isn't"] },
        { id: 'qt-4', type: 'fill-blank', question: 'They didn\'t go, ___ they?', answer: 'did', explanation: 'Negative main clause -> Positive tag' },
        { id: 'qt-5', type: 'choose', question: 'I am late, ___ I?', answer: "aren't", options: ["amn't", "aren't", "am not", "isn't"] },
        { id: 'qt-6', type: 'fill-blank', question: 'Let\'s go, ___ we?', answer: 'shall', explanation: 'Let\'s -> shall' },
        { id: 'qt-7', type: 'choose', question: 'He can swim, ___ he?', answer: "can't", options: ["can", "can't", "couldn't", "isn't"] },
        { id: 'qt-8', type: 'fill-blank', question: 'You haven\'t seen him, ___ you?', answer: 'have', explanation: 'Present Perfect tag' },
        { id: 'qt-9', type: 'choose', question: 'She was tired, ___ she?', answer: "wasn't", options: ["was", "wasn't", "didn't", "is"] },
        { id: 'qt-10', type: 'fill-blank', question: 'Wait for me, ___ you?', answer: 'will', explanation: 'Imperative -> will' }
    ],
    // 20. Indirect Questions
    'indirect-questions': [
        { id: 'iq-1', type: 'choose', question: 'Do you know where ___?', answer: 'he is', options: ['is he', 'he is', 'he be', 'is him'] },
        { id: 'iq-2', type: 'fill-blank', question: 'Can you tell me what time ___ (it/be)?', answer: 'it is', explanation: 'No inversion' },
        { id: 'iq-3', type: 'choose', question: 'I wonder ___ she is happy.', answer: 'if', options: ['that', 'if', 'what', 'which'] },
        { id: 'iq-4', type: 'fill-blank', question: 'Do you know how much ___ (this/cost)?', answer: 'this costs', explanation: 'Subject + Verb' },
        { id: 'iq-5', type: 'choose', question: 'Could you tell me where the bank ___?', answer: 'is', options: ['is', 'are', 'be', 'was'] },
        { id: 'iq-6', type: 'fill-blank', question: 'I don\'t know where ___ (they/live).', answer: 'they live', explanation: 'No auxiliary "do"' },
        { id: 'iq-7', type: 'choose', question: 'Do you have any idea when ___ arrive?', answer: 'they', options: ['do they', 'they', 'are they', 'did they'] },
        { id: 'iq-8', type: 'fill-blank', question: 'Can you show me how ___ (this/work)?', answer: 'this works', explanation: 'S + V' },
        { id: 'iq-9', type: 'choose', question: 'I wonder who ___ that man.', answer: 'is', options: ['is', 'are', 'be', 'am'] },
        { id: 'iq-10', type: 'fill-blank', question: 'Please tell me what ___ (you/want).', answer: 'you want', explanation: 'Direct order' }
    ],
    // 21. Comparatives
    'comparatives': [
        { id: 'comp-1', type: 'choose', question: 'He is ___ than me.', answer: 'taller', options: ['tall', 'taller', 'tallest', 'more tall'] },
        { id: 'comp-2', type: 'fill-blank', question: 'This is the ___ (good) book I have read.', answer: 'best', explanation: 'Superlative' },
        { id: 'comp-3', type: 'choose', question: 'She is the ___ student in class.', answer: 'smartest', options: ['smart', 'smarter', 'smartest', 'most smart'] },
        { id: 'comp-4', type: 'fill-blank', question: 'My car is ___ (expensive) than yours.', answer: 'more expensive', explanation: 'Long adjective' },
        { id: 'comp-5', type: 'choose', question: '___ faster you drive, the more dangerous it is.', answer: 'The', options: ['A', 'The', 'As', 'So'] },
        { id: 'comp-6', type: 'fill-blank', question: 'It is getting ___ (hot) and ___ (hot).', answer: 'hotter and hotter', explanation: 'Double comparative' },
        { id: 'comp-7', type: 'choose', question: 'He is as ___ as a lion.', answer: 'brave', options: ['brave', 'braver', 'bravest', 'more brave'] },
        { id: 'comp-8', type: 'fill-blank', question: 'Who is the ___ (old) person here?', answer: 'oldest', explanation: 'Superlative' },
        { id: 'comp-9', type: 'choose', question: 'This test was ___ than the last one.', answer: 'easier', options: ['easy', 'easier', 'easiest', 'more easy'] },
        { id: 'comp-10', type: 'fill-blank', question: 'She sings ___ (beautifully) than me.', answer: 'more beautifully', explanation: 'Adverb comparative' }
    ],
    // 22. Wish and If only
    'wish-if-only': [
        { id: 'wish-1', type: 'choose', question: 'I wish I ___ rich.', answer: 'were', options: ['am', 'was', 'were', 'be'] },
        { id: 'wish-2', type: 'fill-blank', question: 'If only I ___ (know) the answer.', answer: 'knew', explanation: 'Present wish -> Past Simple' },
        { id: 'wish-3', type: 'choose', question: 'I wish it ___ stop raining.', answer: 'would', options: ['will', 'would', 'can', 'may'] },
        { id: 'wish-4', type: 'fill-blank', question: 'She wishes she ___ (can) fly.', answer: 'could', explanation: 'Can -> Could' },
        { id: 'wish-5', type: 'choose', question: 'If only I ___ eaten so much.', answer: "hadn't", options: ["didn't", "haven't", "hadn't", "wasn't"] },
        { id: 'wish-6', type: 'fill-blank', question: 'I wish I ___ (study) harder for the exam (in the past).', answer: 'had studied', explanation: 'Past wish -> Past Perfect' },
        { id: 'wish-7', type: 'choose', question: 'I wish you ___ make that noise.', answer: "wouldn't", options: ["won't", "wouldn't", "don't", "didn't"] },
        { id: 'wish-8', type: 'fill-blank', question: 'He wishes he ___ (have) a bigger car.', answer: 'had', explanation: 'Present wish' },
        { id: 'wish-9', type: 'choose', question: 'If only you ___ here.', answer: 'were', options: ['are', 'was', 'were', 'win'] },
        { id: 'wish-10', type: 'fill-blank', question: 'I wish I ___ (not/say) that.', answer: "hadn't said", explanation: 'Regret' }
    ],
    // 23. Modal Verbs
    'modal-verbs': [
        { id: 'mv-1', type: 'choose', question: 'You ___ wear a seatbelt.', answer: 'must', options: ['can', 'must', 'may', 'might'] },
        { id: 'mv-2', type: 'fill-blank', question: 'I ___ (can) swim when I was 5.', answer: 'could', explanation: 'Past ability' },
        { id: 'mv-3', type: 'choose', question: '___ I help you?', answer: 'May', options: ['May', 'Must', 'Have', 'Do'] },
        { id: 'mv-4', type: 'fill-blank', question: 'You ___ (should/see) a doctor.', answer: 'should see', explanation: 'Advice' },
        { id: 'mv-5', type: 'choose', question: 'He ___ be at home. His lights are on.', answer: 'must', options: ['can', 'must', 'should', 'need'] },
        { id: 'mv-6', type: 'fill-blank', question: 'We ___ (not/have to) go to school today.', answer: "don't have to", explanation: 'Lack of obligation' },
        { id: 'mv-7', type: 'choose', question: 'You ___ smoke here. It\'s forbidden.', answer: "mustn't", options: ["don't have to", "mustn't", "shouldn't", "needn't"] },
        { id: 'mv-8', type: 'fill-blank', question: 'I ___ (would) like a coffee, please.', answer: 'would', explanation: 'Polite request' },
        { id: 'mv-9', type: 'choose', question: '___ you open the window?', answer: 'Could', options: ['Should', 'Could', 'Must', 'May'] },
        { id: 'mv-10', type: 'fill-blank', question: 'It ___ (might) rain later.', answer: 'might', explanation: 'Possibility' }
    ],
    // 24. Gerunds and Infinitives
    'gerunds-infinitives': [
        { id: 'gi-1', type: 'choose', question: 'I enjoy ___ books.', answer: 'reading', options: ['read', 'to read', 'reading', 'reads'] },
        { id: 'gi-2', type: 'fill-blank', question: 'He wants ___ (go) home.', answer: 'to go', explanation: 'Want + to V' },
        { id: 'gi-3', type: 'choose', question: 'She avoids ___ junk food.', answer: 'eating', options: ['eat', 'to eat', 'eating', 'ate'] },
        { id: 'gi-4', type: 'fill-blank', question: 'I promised ___ (help) her.', answer: 'to help', explanation: 'Promise + to V' },
        { id: 'gi-5', type: 'choose', question: 'We decided ___ stay.', answer: 'to', options: ['to', 'on', 'at', 'in'] },
        { id: 'gi-6', type: 'fill-blank', question: 'Stop ___ (talk)!', answer: 'talking', explanation: 'Stop action' },
        { id: 'gi-7', type: 'choose', question: 'He is good at ___.', answer: 'swimming', options: ['swim', 'to swim', 'swimming', 'swam'] },
        { id: 'gi-8', type: 'fill-blank', question: 'It is important ___ (learn) English.', answer: 'to learn', explanation: 'Adjective + to V' },
        { id: 'gi-9', type: 'choose', question: 'Would you like ___ dance?', answer: 'to', options: ['to', 'ing', 'for', 'with'] },
        { id: 'gi-10', type: 'fill-blank', question: '___ (smoke) is bad for you.', answer: 'Smoking', explanation: 'Subject Gerund' }
    ],
    // 25. Phrasal Verbs
    'phrasal-verbs': [
        { id: 'phv-1', type: 'choose', question: 'Don\'t give ___!', answer: 'up', options: ['up', 'in', 'on', 'off'] },
        { id: 'phv-2', type: 'fill-blank', question: 'Please turn ___ (on/off) the lights.', answer: 'off', explanation: 'Context dependent, usually off for leaving' },
        { id: 'phv-3', type: 'choose', question: 'We ran ___ of gas.', answer: 'out', options: ['off', 'out', 'away', 'over'] },
        { id: 'phv-4', type: 'fill-blank', question: 'I am looking ___ (for) my keys.', answer: 'for', explanation: 'Search' },
        { id: 'phv-5', type: 'choose', question: 'Can you pick me ___?', answer: 'up', options: ['on', 'up', 'in', 'at'] },
        { id: 'phv-6', type: 'fill-blank', question: 'Put ___ (on) your coat.', answer: 'on', explanation: 'Wear' },
        { id: 'phv-7', type: 'choose', question: 'The plane took ___.', answer: 'off', options: ['up', 'off', 'out', 'away'] },
        { id: 'phv-8', type: 'fill-blank', question: 'I get ___ (along) with my sister.', answer: 'along', explanation: 'Good relationship' },
        { id: 'phv-9', type: 'choose', question: 'Look ___! A car.', answer: 'out', options: ['up', 'out', 'in', 'away'] },
        { id: 'phv-10', type: 'fill-blank', question: 'Please write ___ (down) this number.', answer: 'down', explanation: 'Record' }
    ],
    // 26. Irregular Verbs
    'irregular-verbs': [
        { id: 'iv-1', type: 'fill-blank', question: 'Past of "go": ___', answer: 'went', explanation: 'Irregular' },
        { id: 'iv-2', type: 'choose', question: 'Past participle of "eat": ___', answer: 'eaten', options: ['ate', 'eaten', 'eat', 'eating'] },
        { id: 'iv-3', type: 'fill-blank', question: 'Past of "buy": ___', answer: 'bought', explanation: 'Irregular' },
        { id: 'iv-4', type: 'choose', question: 'I have ___ a bird.', answer: 'seen', options: ['saw', 'see', 'seen', 'seeing'] },
        { id: 'iv-5', type: 'fill-blank', question: 'She ___ (drink) water yesterday.', answer: 'drank', explanation: 'Past simple' },
        { id: 'iv-6', type: 'choose', question: 'He ___ the window.', answer: 'broke', options: ['break', 'broke', 'broken', 'breaking'] },
        { id: 'iv-7', type: 'fill-blank', question: 'We ___ (sleep) well.', answer: 'slept', explanation: 'Past simple' },
        { id: 'iv-8', type: 'choose', question: 'They have ___ to London.', answer: 'gone', options: ['go', 'went', 'gone', 'going'] },
        { id: 'iv-9', type: 'fill-blank', question: 'I ___ (think) about it.', answer: 'thought', explanation: 'Past simple' },
        { id: 'iv-10', type: 'choose', question: 'She ___ a song.', answer: 'sang', options: ['sing', 'sang', 'sung', 'sings'] }
    ],
    // 27. Causative Verbs
    'causative-verbs': [
        { id: 'cv-1', type: 'choose', question: 'I had my hair ___.', answer: 'cut', options: ['cut', 'cutting', 'cuts', 'to cut'] },
        { id: 'cv-2', type: 'fill-blank', question: 'He got his car ___ (fix).', answer: 'fixed', explanation: 'Get object V3' },
        { id: 'cv-3', type: 'choose', question: 'She makes me ___.', answer: 'laugh', options: ['laugh', 'to laugh', 'laughing', 'laughed'] },
        { id: 'cv-4', type: 'fill-blank', question: 'I let him ___ (use) my phone.', answer: 'use', explanation: 'Let object V' },
        { id: 'cv-5', type: 'choose', question: 'We had the house ___.', answer: 'painted', options: ['paint', 'painted', 'painting', 'paints'] },
        { id: 'cv-6', type: 'fill-blank', question: 'My mom made me ___ (clean) my room.', answer: 'clean', explanation: 'Make object V' },
        { id: 'cv-7', type: 'choose', question: 'Can you help me ___ this?', answer: 'do', options: ['do', 'done', 'did', 'doing'] },
        { id: 'cv-8', type: 'fill-blank', question: 'I will get her ___ (call) you.', answer: 'to call', explanation: 'Get person TO V' },
        { id: 'cv-9', type: 'choose', question: 'He allowed me ___ go.', answer: 'to', options: ['to', 'for', 'in', 'at'] },
        { id: 'cv-10', type: 'fill-blank', question: 'She had the dress ___ (shorten).', answer: 'shortened', explanation: 'Have object V3' }
    ],
    // 28. Used to
    'used-to': [
        { id: 'ut-1', type: 'choose', question: 'I ___ to play tennis.', answer: 'used', options: ['use', 'used', 'using', 'uses'] },
        { id: 'ut-2', type: 'fill-blank', question: 'I didn\'t ___ (use) to like olives.', answer: 'use', explanation: 'Did not use to' },
        { id: 'ut-3', type: 'choose', question: 'She is used to ___ early.', answer: 'getting up', options: ['get up', 'getting up', 'got up', 'gets up'] },
        { id: 'ut-4', type: 'fill-blank', question: 'We ___ (would) go fishing every summer.', answer: 'would', explanation: 'Past habit' },
        { id: 'ut-5', type: 'choose', question: 'Are you ___ to the weather?', answer: 'used', options: ['use', 'used', 'using', 'uses'] },
        { id: 'ut-6', type: 'fill-blank', question: 'He is getting used to ___ (drive) on the left.', answer: 'driving', explanation: 'Get used to + V-ing' },
        { id: 'ut-7', type: 'choose', question: 'Did you ___ to live here?', answer: 'use', options: ['use', 'used', 'using', 'uses'] },
        { id: 'ut-8', type: 'fill-blank', question: 'There ___ (used/be) a park here.', answer: 'used to be', explanation: 'Past state' },
        { id: 'ut-9', type: 'choose', question: 'I am not used to ___ spicy food.', answer: 'eating', options: ['eat', 'eating', 'ate', 'eaten'] },
        { id: 'ut-10', type: 'fill-blank', question: 'My dad ___ (used/smoke).', answer: 'used to smoke', explanation: 'Past habit' }
    ],
    // 29. Quantifiers
    'quantifiers': [
        { id: 'quant-1', type: 'choose', question: 'I have ___ money.', answer: 'some', options: ['any', 'some', 'a', 'an'] },
        { id: 'quant-2', type: 'fill-blank', question: 'Do you have ___ (any) questions?', answer: 'any', explanation: 'Question form' },
        { id: 'quant-3', type: 'choose', question: 'How ___ water do you drink?', answer: 'much', options: ['many', 'much', 'some', 'any'] },
        { id: 'quant-4', type: 'fill-blank', question: 'There are ___ (many) people here.', answer: 'many', explanation: 'Countable' },
        { id: 'quant-5', type: 'choose', question: 'I have a ___ friends.', answer: 'few', options: ['little', 'few', 'much', 'less'] },
        { id: 'quant-6', type: 'fill-blank', question: 'We have ___ (little) time.', answer: 'little', explanation: 'Uncountable small amount' },
        { id: 'quant-7', type: 'choose', question: '___ of the students passed.', answer: 'All', options: ['Every', 'All', 'Each', 'Whole'] },
        { id: 'quant-8', type: 'fill-blank', question: 'How ___ (many) apples do you want?', answer: 'many', explanation: 'Countable' },
        { id: 'quant-9', type: 'choose', question: 'There isn\'t ___ sugar left.', answer: 'much', options: ['many', 'much', 'some', 'few'] },
        { id: 'quant-10', type: 'fill-blank', question: '___ (No) students failed the test.', answer: 'No', explanation: 'Zero quantity' }
    ],
    // 30. Word Order
    'word-order': [
        { id: 'wo-1', type: 'choose', question: 'I ___ play tennis.', answer: 'always', options: ['always', 'yesterday', 'tomorrow', 'next week'] },
        { id: 'wo-2', type: 'fill-blank', question: 'She ___ (drink/coffee) in the morning.', answer: 'drinks coffee', explanation: 'S + V + O' },
        { id: 'wo-3', type: 'choose', question: 'Where ___?', answer: 'do you live', options: ['you live', 'do you live', 'live you', 'does you live'] },
        { id: 'wo-4', type: 'fill-blank', question: 'He ___ (not/speak) English well.', answer: "doesn't speak", explanation: 'Aux + Not + V' },
        { id: 'wo-5', type: 'choose', question: 'I ___ him yesterday.', answer: 'saw', options: ['see', 'saw', 'seen', 'seeing'] },
        { id: 'wo-6', type: 'fill-blank', question: '___ (Never/I) have seen such a thing.', answer: 'Never have I', explanation: 'Inversion' },
        { id: 'wo-7', type: 'choose', question: 'Slowly, she ___ the door.', answer: 'opened', options: ['open', 'opened', 'opens', 'opening'] },
        { id: 'wo-8', type: 'fill-blank', question: 'What ___ (you/doing) now?', answer: 'are you doing', explanation: 'Wh + Aux + S + V' },
        { id: 'wo-9', type: 'choose', question: 'He is ___ late.', answer: 'always', options: ['always', 'yesterday', 'last year', 'ago'] },
        { id: 'wo-10', type: 'fill-blank', question: 'She ___ (sing/beautifully).', answer: 'sings beautifully', explanation: 'V + Adv' }
    ]
};

