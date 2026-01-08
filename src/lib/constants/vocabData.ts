export interface VocabWord {
    id: string;
    word: string;
    definition: string;
    example: string;
    topic: string; // 'Academic', 'Science', 'Business', 'Society', 'Environment', 'Advanced', 'General'
    phonetic?: string;
    difficulty?: 'easy' | 'medium' | 'hard';

    // --- New Foundation Building Fields (Phase 1 Upgrade) ---
    type?: 'noun' | 'verb' | 'adj' | 'adv' | 'phrase';
    audioUrl?: string;
    collocations?: string[]; // e.g., ["conduct research", "test a hypothesis"]
    commonMistakes?: string[]; // e.g., "Don't say 'do a research'"
}


export interface SentencePart {
    id: string;
    text: string;
    type: 'S' | 'V' | 'O' | 'M' | 'X'; // X for Distractor
    translation?: string;
}

export interface SentenceChallenge {
    id: string;
    topic: string; // Matches vocabulary topic
    fullSentence: string;
    translation: string;
    parts: SentencePart[];
    correctOrder: string[]; // Array of part IDs
    distractors?: SentencePart[];
    explanation?: string; // Grammar/Vocab note
}

export const SENTENCE_CHALLENGES: Record<string, SentenceChallenge[]> = {
    'Academic': [
        {
            id: 'acad-sent-1',
            topic: 'Academic',
            fullSentence: "The researchers formed a hypothesis about the spread of the disease.",
            translation: "Các nhà nghiên cứu đã hình thành một giả thuyết về sự lây lan của căn bệnh.",
            parts: [
                { id: 'p1', text: "The researchers", type: 'S' },
                { id: 'p2', text: "formed", type: 'V' },
                { id: 'p3', text: "a hypothesis", type: 'O' },
                { id: 'p4', text: "about the spread", type: 'M' },
                { id: 'p5', text: "of the disease", type: 'M' }
            ],
            correctOrder: ['p1', 'p2', 'p3', 'p4', 'p5'],
            distractors: [
                { id: 'd1', text: "scientific", type: 'X' },
                { id: 'd2', text: "proved", type: 'X' }
            ],
            explanation: "Subject (Researchers) + Verb (formed) + Object (hypothesis). 'About...' and 'of...' are modifiers."
        },
        {
            id: 'acad-sent-2',
            topic: 'Academic',
            fullSentence: "They provided empirical evidence to support their argument.",
            translation: "Họ đã cung cấp bằng chứng thực nghiệm để hỗ trợ lập luận của mình.",
            parts: [
                { id: 'p1', text: "They", type: 'S' },
                { id: 'p2', text: "provided", type: 'V' },
                { id: 'p3', text: "empirical evidence", type: 'O' },
                { id: 'p4', text: "to support", type: 'M' },
                { id: 'p5', text: "their argument", type: 'O' } // Technically inside infinitive phrase, but treating as chunk
            ],
            correctOrder: ['p1', 'p2', 'p3', 'p4', 'p5'],
            distractors: [
                { id: 'd1', text: "theory", type: 'X' },
                { id: 'd2', text: "guessing", type: 'X' }
            ],
            explanation: "'Empirical' means based on observation/experience."
        },
        {
            id: 'acad-sent-3',
            topic: 'Academic',
            fullSentence: "Statistical analysis of the data is crucial for validity.",
            translation: "Phân tích thống kê dữ liệu là rất quan trọng cho tính hợp lệ.",
            parts: [
                { id: 'p1', text: "Statistical analysis", type: 'S' },
                { id: 'p2', text: "of the data", type: 'M' },
                { id: 'p3', text: "is", type: 'V' },
                { id: 'p4', text: "crucial", type: 'O' }, // Adjective compliment
                { id: 'p5', text: "for validity", type: 'M' }
            ],
            correctOrder: ['p1', 'p2', 'p3', 'p4', 'p5'],
            distractors: [
                { id: 'd1', text: "irrelevant", type: 'X' },
                { id: 'd2', text: "numbers", type: 'X' }
            ]
        },
        {
            id: 'acad-sent-4',
            topic: 'Academic',
            fullSentence: "Darwin's theory of evolution changed our perspective on biology.",
            translation: "Thuyết tiến hóa của Darwin đã thay đổi quan điểm của chúng ta về sinh học.",
            parts: [
                { id: 'p1', text: "Darwin's theory", type: 'S' },
                { id: 'p2', text: "of evolution", type: 'M' },
                { id: 'p3', text: "changed", type: 'V' },
                { id: 'p4', text: "our perspective", type: 'O' },
                { id: 'p5', text: "on biology", type: 'M' }
            ],
            correctOrder: ['p1', 'p2', 'p3', 'p4', 'p5'],
            distractors: [
                { id: 'd1', text: "created", type: 'X' },
                { id: 'd2', text: "science", type: 'X' }
            ]
        }
    ]
};

export const VOCAB_DATA: VocabWord[] = [
    // --- Topic: Academic / Research ---
    { id: 'acad-1', word: "hypothesis", definition: "a supposition or proposed explanation made on the basis of limited evidence.", example: "The researchers formed a hypothesis about the spread of the disease.", topic: "Academic", phonetic: "/haɪˈpɒθɪsɪs/", difficulty: 'medium' },
    { id: 'acad-2', word: "empirical", definition: "based on, concerned with, or verifiable by observation or experience.", example: "They provided empirical evidence to support their argument.", topic: "Academic", phonetic: "/ɛmˈpɪrɪk(ə)l/", difficulty: 'hard' },
    { id: 'acad-3', word: "qualitative", definition: "relating to, measuring, or measured by the quality of something.", example: "A qualitative analysis of the interview data was conducted.", topic: "Academic", phonetic: "/ˈkwɒlɪtətɪv/", difficulty: 'medium' },
    { id: 'acad-4', word: "delineate", definition: "describe or portray (something) precisely.", example: "The law should delineate and prohibit behavior that is socially abhorrent.", topic: "Academic", phonetic: "/dɪˈlɪnɪeɪt/", difficulty: 'hard' },
    { id: 'acad-5', word: "equivocate", definition: "use ambiguous language so as to conceal the truth.", example: "Usually I equivocate, but this time I told the truth.", topic: "Academic", phonetic: "/ɪˈkwɪvəkeɪt/", difficulty: 'hard' },
    { id: 'acad-6', word: "conclude", definition: "arrive at a judgment or opinion by reasoning.", example: "The doctors concluded that he had suffered a stroke.", topic: "Academic", phonetic: "/kənˈkluːd/", difficulty: 'easy' },
    { id: 'acad-7', word: "infer", definition: "deduce or conclude (information) from evidence.", example: "From these facts we can infer that the crime was premeditated.", topic: "Academic", phonetic: "/ɪnˈfɜː(r)/", difficulty: 'medium' },
    { id: 'acad-8', word: "analysis", definition: "detailed examination of the elements or structure of something.", example: "Statistical analysis of the data.", topic: "Academic", phonetic: "/əˈnæləsɪs/", difficulty: 'medium' },
    { id: 'acad-9', word: "theory", definition: "a supposition or a system of ideas intended to explain something.", example: "Darwin's theory of evolution.", topic: "Academic", phonetic: "/ˈθɪəri/", difficulty: 'easy' },
    { id: 'acad-10', word: "validity", definition: "the quality of being logically or factually sound.", example: "One might question the validity of our data.", topic: "Academic", phonetic: "/vəˈlɪdɪti/", difficulty: 'medium' },
    { id: 'acad-11', word: "interpretation", definition: "the action of explaining the meaning of something.", example: "This evidence is open to varying interpretations.", topic: "Academic", phonetic: "/ɪnˌtɜːprɪˈteɪʃn/", difficulty: 'hard' },
    { id: 'acad-12', word: "significance", definition: "the quality of being worthy of attention; importance.", example: "The significance of the result is clear.", topic: "Academic", phonetic: "/sɪɡˈnɪfɪkəns/", difficulty: 'medium' },
    { id: 'acad-13', word: "perspective", definition: "a particular attitude toward or way of regarding something.", example: "Most literature is written from a male perspective.", topic: "Academic", phonetic: "/pəˈspɛktɪv/", difficulty: 'medium' },
    { id: 'acad-14', word: "framework", definition: "a basic structure underlying a system, concept, or text.", example: "The theoretical framework of political sociology.", topic: "Academic", phonetic: "/ˈfreɪmwəːk/", difficulty: 'medium' },
    { id: 'acad-15', word: "evaluate", definition: "form an idea of the amount, number, or value of; assess.", example: "The study will evaluate the long-term effects.", topic: "Academic", phonetic: "/ɪˈvaljʊeɪt/", difficulty: 'medium' },
    { id: 'acad-16', word: "journal", definition: "a newspaper or magazine that deals with a particular subject.", example: "A medical journal.", topic: "Academic", phonetic: "/ˈdʒəːn(ə)l/", difficulty: 'easy' },
    { id: 'acad-17', word: "data", definition: "facts and statistics collected together for reference or analysis.", example: "There is very little data available.", topic: "Academic", phonetic: "/ˈdeɪtə/", difficulty: 'easy' },
    { id: 'acad-18', word: "comprehensive", definition: "complete; including all or nearly all elements or aspects.", example: "A comprehensive list of sources.", topic: "Academic", phonetic: "/ˌkɒmprɪˈhɛnsɪv/", difficulty: 'medium' },
    { id: 'acad-19', word: "reference", definition: "the action of mentioning or alluding to something.", example: "He made reference to the enormous power of the mass media.", topic: "Academic", phonetic: "/ˈrɛfrəns/", difficulty: 'medium' },
    { id: 'acad-20', word: "thesis", definition: "a statement or theory that is put forward as a premise to be maintained or proved.", example: "His central thesis is that modern life is alienating.", topic: "Academic", phonetic: "/ˈθiːsɪs/", difficulty: 'hard' },
    { id: 'acad-21', word: "abstract", definition: "existing in thought or as an idea but not having a physical or concrete existence.", example: "Abstract concepts such as love or beauty.", topic: "Academic", phonetic: "/ˈabstrakt/", difficulty: 'medium' },
    { id: 'acad-22', word: "accumulate", definition: "gather together or acquire an increasing number or quantity of.", example: "Investigators have yet to accumulate enough evidence.", topic: "Academic", phonetic: "/əˈkjuːmjʊleɪt/", difficulty: 'medium' },
    { id: 'acad-23', word: "acknowledge", definition: "accept or admit the existence or truth of.", example: "The plight of the refugees was acknowledged by the authorities.", topic: "Academic", phonetic: "/əkˈnɒlɪdʒ/", difficulty: 'medium' },
    { id: 'acad-24', word: "clarify", definition: "make (a statement or situation) less confused and more clearly comprehensible.", example: "The report aims to clarify the situation.", topic: "Academic", phonetic: "/ˈklarɪfʌɪ/", difficulty: 'easy' },
    { id: 'acad-25', word: "coherent", definition: "logical and consistent.", example: "They failed to develop a coherent economic strategy.", topic: "Academic", phonetic: "/kə(ʊ)ˈhɪər(ə)nt/", difficulty: 'hard' },
    { id: 'acad-26', word: "context", definition: "the circumstances that form the setting for an event.", example: "The proposals need to be considered in the context of new European directives.", topic: "Academic", phonetic: "/ˈkɒntɛkst/", difficulty: 'medium' },
    { id: 'acad-27', word: "contradict", definition: "deny the truth of (a statement) by asserting the opposite.", example: "The survey appears to contradict the industry's claims.", topic: "Academic", phonetic: "/kɒntrəˈdɪkt/", difficulty: 'medium' },
    { id: 'acad-28', word: "crucial", definition: "decisive or critical, especially in the success or failure of something.", example: "Negotiations were at a crucial stage.", topic: "Academic", phonetic: "/ˈkruːʃ(ə)l/", difficulty: 'medium' },
    { id: 'acad-29', word: "differentiate", definition: "recognize or ascertain what makes (someone or something) different.", example: "Children can differentiate between fantasy and reality.", topic: "Academic", phonetic: "/ˌdɪfəˈrɛnʃɪeɪt/", difficulty: 'hard' },
    { id: 'acad-30', word: "evolve", definition: "develop gradually, especially from a simple to a more complex form.", example: "The company has evolved into a major chemical manufacturer.", topic: "Academic", phonetic: "/ɪˈvɒlv/", difficulty: 'medium' },
    { id: 'acad-31', word: "fluctuate", definition: "rise and fall irregularly in number or amount.", example: "Trade with other countries tends to fluctuate.", topic: "Academic", phonetic: "/ˈflʌktʃʊeɪt/", difficulty: 'hard' },
    { id: 'acad-32', word: "formulate", definition: "create or devise methodically (a strategy or a proposal).", example: "Economists and statisticians were needed to formulate economic policy.", topic: "Academic", phonetic: "/ˈfɔːmjʊleɪt/", difficulty: 'medium' },
    { id: 'acad-33', word: "imply", definition: "strongly suggest the truth or existence of (something not expressly stated).", example: "The salesmen who uses jargon to imply superior knowledge.", topic: "Academic", phonetic: "/ɪmˈplʌɪ/", difficulty: 'medium' },
    { id: 'acad-34', word: "indicate", definition: "point out; show.", example: "Dotted lines indicate the text's margins.", topic: "Academic", phonetic: "/ˈɪndɪkeɪt/", difficulty: 'easy' },
    { id: 'acad-35', word: "justify", definition: "show or prove to be right or reasonable.", example: "The person appointed has fully justified our confidence.", topic: "Academic", phonetic: "/ˈdʒʌstɪfʌɪ/", difficulty: 'medium' },
    { id: 'acad-36', word: "methodology", definition: "a system of methods used in a particular area of study or activity.", example: "A methodology for investigating the concept of focal points.", topic: "Academic", phonetic: "/ˌmɛθəˈdɒlədʒi/", difficulty: 'hard' },
    { id: 'acad-37', word: "precede", definition: "come before (something) in time.", example: "A gun battle had preceded the explosions.", topic: "Academic", phonetic: "/prɪˈsiːd/", difficulty: 'medium' },
    { id: 'acad-38', word: "presume", definition: "suppose that something is the case on the basis of probability.", example: "Two of the journalists were missing and presumed dead.", topic: "Academic", phonetic: "/prɪˈzjuːm/", difficulty: 'medium' },
    { id: 'acad-39', word: "rational", definition: "based on or in accordance with reason or logic.", example: "I'm sure there's a perfectly rational explanation.", topic: "Academic", phonetic: "/ˈraʃ(ə)n(ə)l/", difficulty: 'medium' },
    { id: 'acad-40', word: "reliable", definition: "consistently good in quality or performance; able to be trusted.", example: "A reliable source of information.", topic: "Academic", phonetic: "/rɪˈlʌɪəb(ə)l/", difficulty: 'easy' },

    // --- Topic: Science / Technology ---
    { id: 'sci-1', word: "catalyst", definition: "a substance that increases the rate of a chemical reaction.", example: "Chlorine acts as a catalyst promoting the breakdown of ozone.", topic: "Science", phonetic: "/ˈkat(ə)lɪst/", difficulty: 'medium' },
    { id: 'sci-2', word: "density", definition: "the degree of compactness of a substance.", example: "A reduction in bone density.", topic: "Science", phonetic: "/ˈdɛnsɪti/", difficulty: 'medium' },
    { id: 'sci-3', word: "ventilation", definition: "the provision of fresh air to a room, building, etc.", example: "Ventilation shafts.", topic: "Science", phonetic: "/ˌvɛntɪˈleɪʃ(ə)n/", difficulty: 'medium' },
    { id: 'sci-4', word: "hermetic", definition: "complete and airtight.", example: "A hermetic seal.", topic: "Science", phonetic: "/həːˈmɛtɪk/", difficulty: 'hard' },
    { id: 'sci-5', word: "oxide", definition: "a binary compound of oxygen with another element.", example: "Carbon dioxide.", topic: "Science", phonetic: "/ˈɒksʌɪd/", difficulty: 'medium' },
    { id: 'sci-6', word: "acid", definition: "a molecule or other entity that can donate a proton or accept an electron pair.", example: "Rainwater is naturally slightly acidic.", topic: "Science", phonetic: "/ˈasɪd/", difficulty: 'easy' },
    { id: 'sci-7', word: "magnetic", definition: "capable of being attracted by or acquiring the properties of a magnet.", example: "Magnetic fields.", topic: "Science", phonetic: "/maɡˈnɛtɪk/", difficulty: 'medium' },
    { id: 'sci-8', word: "fossil", definition: "the remains or impression of a prehistoric organism.", example: "Fossil fuels.", topic: "Science", phonetic: "/ˈfɒs(ə)l/", difficulty: 'medium' },
    { id: 'sci-9', word: "ozone", definition: "a colorless unstable toxic gas with a pungent odor.", example: "The ozone layer.", topic: "Science", phonetic: "/ˈəʊzəʊn/", difficulty: 'medium' },
    { id: 'sci-10', word: "volcano", definition: "a mountain or hill, having a crater or vent through which lava, rock fragments, hot vapor, and gas are being or have been erupted.", example: "An active volcano.", topic: "Science", phonetic: "/vɒlˈkeɪnəʊ/", difficulty: 'medium' },
    { id: 'sci-11', word: "alluvial", definition: "relating to or derived from alluvium (deposit of clay, silt, sand, and gravel).", example: "Rich alluvial soils.", topic: "Science", phonetic: "/əˈluːvɪəl/", difficulty: 'hard' },
    { id: 'sci-12', word: "delta", definition: "a triangular tract of sediment deposited at the mouth of a river.", example: "The Nile Delta.", topic: "Science", phonetic: "/ˈdɛltə/", difficulty: 'medium' },
    { id: 'sci-13', word: "ecosystem", definition: "a biological community of interacting organisms and their physical environment.", example: "The marine ecosystem.", topic: "Science", phonetic: "/ˈiːkəʊsɪstəm/", difficulty: 'medium' },
    { id: 'sci-14', word: "atmospheric", definition: "relating to the atmosphere of the earth.", example: "Atmospheric pressure.", topic: "Science", phonetic: "/atməsˈfɛrɪk/", difficulty: 'medium' },
    { id: 'sci-15', word: "corrode", definition: "destroy or damage (metal, stone, or other materials) slowly by chemical action.", example: "Acid rain corrodes buildings.", topic: "Science", phonetic: "/kəˈrəʊd/", difficulty: 'medium' },
    { id: 'sci-16', word: "soluble", definition: "(of a substance) able to be dissolved, especially in water.", example: "Water-soluble vitamins.", topic: "Science", phonetic: "/ˈsɒljʊb(ə)l/", difficulty: 'medium' },
    { id: 'sci-17', word: "dioxide", definition: "an oxide containing two atoms of oxygen in its molecule.", example: "Carbon dioxide.", topic: "Science", phonetic: "/dʌɪˈɒksʌɪd/", difficulty: 'medium' },
    { id: 'sci-18', word: "gravity", definition: "the force that attracts a body toward the center of the earth.", example: "The laws of gravity.", topic: "Science", phonetic: "/ˈɡravɪti/", difficulty: 'medium' },
    { id: 'sci-19', word: "molecule", definition: "a group of atoms bonded together.", example: "A molecule of water.", topic: "Science", phonetic: "/ˈmɒlɪkjuːl/", difficulty: 'hard' },
    { id: 'sci-20', word: "organism", definition: "an individual animal, plant, or single-celled life form.", example: "Microscopic organisms.", topic: "Science", phonetic: "/ˈɔːɡ(ə)nɪz(ə)m/", difficulty: 'medium' },
    { id: 'sci-21', word: "solar", definition: "relating to or determined by the sun.", example: "Solar energy.", topic: "Science", phonetic: "/ˈsəʊlə/", difficulty: 'easy' },
    { id: 'sci-22', word: "orbit", definition: "the curved path of a celestial object or spacecraft around a star, planet, or moon.", example: "The earth's orbit around the sun.", topic: "Science", phonetic: "/ˈɔːbɪt/", difficulty: 'medium' },
    { id: 'sci-23', word: "radiation", definition: "the emission of energy as electromagnetic waves.", example: "Ultraviolet radiation.", topic: "Science", phonetic: "/reɪdɪˈeɪʃ(ə)n/", difficulty: 'medium' },
    { id: 'sci-24', word: "species", definition: "a group of living organisms consisting of similar individuals.", example: "Endangered species.", topic: "Science", phonetic: "/ˈspiːʃiːz/", difficulty: 'medium' },
    { id: 'sci-25', word: "element", definition: "a part or aspect of something abstract, especially one that is essential or characteristic.", example: "The death had all the elements of a great tabloid story.", topic: "Science", phonetic: "/ˈɛlɪm(ə)nt/", difficulty: 'easy' },
    { id: 'sci-26', word: "compound", definition: "a thing that is composed of two or more separate elements; a mixture.", example: "The air smelled like a compound of diesel and petrol fumes.", topic: "Science", phonetic: "/ˈkɒmpaʊnd/", difficulty: 'hard' },
    { id: 'sci-27', word: "electron", definition: "a stable subatomic particle with a charge of negative electricity.", example: "Electron microscope.", topic: "Science", phonetic: "/ɪˈlɛktrɒn/", difficulty: 'hard' },
    { id: 'sci-28', word: "laboratory", definition: "a room or building equipped for scientific experiments, research, or teaching.", example: "A research laboratory.", topic: "Science", phonetic: "/ləˈbɒrət(ə)ri/", difficulty: 'medium' },
    { id: 'sci-29', word: "mass", definition: "a large body of matter with no definite shape.", example: "A mass of curly hair.", topic: "Science", phonetic: "/mas/", difficulty: 'easy' },
    { id: 'sci-30', word: "microscope", definition: "an optical instrument used for viewing very small objects.", example: "Examining cells under a microscope.", topic: "Science", phonetic: "/ˈmʌɪkrəskəʊp/", difficulty: 'easy' },
    { id: 'sci-31', word: "satellite", definition: "an artificial body placed in orbit around the earth or moon.", example: "A communications satellite.", topic: "Science", phonetic: "/ˈsatəlʌɪt/", difficulty: 'medium' },
    { id: 'sci-32', word: "simulation", definition: "imitation of a situation or process.", example: "A computer simulation of the accident.", topic: "Science", phonetic: "/sɪmjʊˈleɪʃ(ə)n/", difficulty: 'medium' },
    { id: 'sci-33', word: "spectrum", definition: "a band of colors, as seen in a rainbow.", example: "The visible spectrum.", topic: "Science", phonetic: "/ˈspɛktrəm/", difficulty: 'hard' },
    { id: 'sci-34', word: "statistics", definition: "the practice or science of collecting and analyzing numerical data.", example: "Official statistics show a decline in crime.", topic: "Science", phonetic: "/stəˈtɪstɪks/", difficulty: 'medium' },
    { id: 'sci-35', word: "thermal", definition: "relating to heat.", example: "Thermal conductivity.", topic: "Science", phonetic: "/ˈθəːm(ə)l/", difficulty: 'medium' },
    { id: 'sci-36', word: "velocity", definition: "the speed of something in a given direction.", example: "The velocities of the emitted particles.", topic: "Science", phonetic: "/vɪˈlɒsɪti/", difficulty: 'hard' },
    { id: 'sci-37', word: "calibrate", definition: "mark (a gauge or instrument) with a standard scale of readings.", example: "Calibrate the thermometer.", topic: "Science", phonetic: "/ˈkalɪbreɪt/", difficulty: 'hard' },
    { id: 'sci-38', word: "diffuse", definition: "spread or cause to spread over a wide area or among a large number of people.", example: "Technologies diffuse rapidly.", topic: "Science", phonetic: "/dɪˈfjuːz/", difficulty: 'hard' },
    { id: 'sci-39', word: "equilibrium", definition: "a state in which opposing forces or influences are balanced.", example: "The task is the reliability of the equilibrium system.", topic: "Science", phonetic: "/ˌiːkwɪˈlɪbrɪəm/", difficulty: 'hard' },
    { id: 'sci-40', word: "inertia", definition: "a tendency to do nothing or to remain unchanged.", example: "The bureaucratic inertia of government.", topic: "Science", phonetic: "/ɪˈnəːʃə/", difficulty: 'hard' },

    // --- Topic: Business / Work ---
    { id: 'bus-1', word: "lucrative", definition: "producing a great deal of profit.", example: "A lucrative business.", topic: "Business", phonetic: "/ˈluːkrətɪv/", difficulty: 'medium' },
    { id: 'bus-2', word: "mitigate", definition: "make less severe, serious, or painful.", example: "He wanted to mitigate misery in the world.", topic: "Business", phonetic: "/ˈmɪtɪɡeɪt/", difficulty: 'medium' },
    { id: 'bus-3', word: "infrastructure", definition: "the basic physical and organizational structures and facilities.", example: "The social and economic infrastructure of a country.", topic: "Business", phonetic: "/ˈɪnfrəstrʌktʃə/", difficulty: 'hard' },
    { id: 'bus-4', word: "allocate", definition: "distribute (resources or duties) for a particular purpose.", example: "The authorities allocated 50,000 places to refugees.", topic: "Business", phonetic: "/ˈaləkeɪt/", difficulty: 'medium' },
    { id: 'bus-5', word: "shareholder", definition: "an owner of shares in a company.", example: "The shareholders voted for the merger.", topic: "Business", phonetic: "/ˈʃɛːhəʊldə/", difficulty: 'medium' },
    { id: 'bus-6', word: "revenue", definition: "income, especially when of a company or organization and of a substantial nature.", example: "Traders have lost £10,000 in revenue.", topic: "Business", phonetic: "/ˈrɛvənjuː/", difficulty: 'medium' },
    { id: 'bus-7', word: "dividend", definition: "a sum of money paid regularly by a company to its shareholders.", example: "A dividend of 5p per share.", topic: "Business", phonetic: "/ˈdɪvɪdɛnd/", difficulty: 'hard' },
    { id: 'bus-8', word: "asset", definition: "a useful or valuable thing, person, or quality.", example: "Quick reflexes were his chief asset.", topic: "Business", phonetic: "/ˈasɛt/", difficulty: 'easy' },
    { id: 'bus-9', word: "client", definition: "a person or organization using the services of a lawyer or other professional person or company.", example: "Insurance claim clients.", topic: "Business", phonetic: "/ˈklʌɪənt/", difficulty: 'easy' },
    { id: 'bus-10', word: "contract", definition: "a written or spoken agreement, especially one concerning employment, sales, or tenancy.", example: "He has signed a contract.", topic: "Business", phonetic: "/ˈkɒntrakt/", difficulty: 'easy' },
    { id: 'bus-11', word: "promotion", definition: "activity that supports or provides active encouragement for the furtherance of a cause, venture, or aim.", example: "The promotion of the use of bicycle.", topic: "Business", phonetic: "/prəˈməʊʃ(ə)n/", difficulty: 'medium' },
    { id: 'bus-12', word: "recruit", definition: "enlist (someone) in the armed forces or other organization.", example: "We recruit only the best.", topic: "Business", phonetic: "/rɪˈkruːt/", difficulty: 'medium' },
    { id: 'bus-13', word: "consumer", definition: "a person who purchases goods and services for personal use.", example: "Consumer demand.", topic: "Business", phonetic: "/kənˈsjuːmə/", difficulty: 'easy' },
    { id: 'bus-14', word: "currency", definition: "a system of money in general use in a particular country.", example: "The dollar was a strong currency.", topic: "Business", phonetic: "/ˈkʌr(ə)nsi/", difficulty: 'medium' },
    { id: 'bus-15', word: "economy", definition: "the wealth and resources of a country or region.", example: "One of the fastest growing economies in the world.", topic: "Business", phonetic: "/ɪˈkɒnəmi/", difficulty: 'easy' },
    { id: 'bus-16', word: "export", definition: "send (goods or services) to another country for sale.", example: "We export beef to the US.", topic: "Business", phonetic: "/ɪkˈspɔːt/", difficulty: 'easy' },
    { id: 'bus-17', word: "import", definition: "bring (goods or services) into a country from abroad for sale.", example: "Japan imports iron ore.", topic: "Business", phonetic: "/ˈɪmpɔːt/", difficulty: 'easy' },
    { id: 'bus-18', word: "industry", definition: "economic activity concerned with the processing of raw materials and manufacture of goods in factories.", example: "The competitiveness of American industry.", topic: "Business", phonetic: "/ˈɪndəstri/", difficulty: 'easy' },
    { id: 'bus-19', word: "market", definition: "a regular gathering of people for the purchase and sale of provisions, livestock, and other commodities.", example: "Farmers going to market.", topic: "Business", phonetic: "/ˈmɑːkɪt/", difficulty: 'easy' },
    { id: 'bus-20', word: "product", definition: "an article or substance that is manufactured or refined for sale.", example: "Dairy products.", topic: "Business", phonetic: "/ˈprɒdʌkt/", difficulty: 'easy' },
    { id: 'bus-21', word: "budget", definition: "an estimate of income and expenditure for a set period of time.", example: "Keep within the budget.", topic: "Business", phonetic: "/ˈbʌdʒɪt/", difficulty: 'medium' },
    { id: 'bus-22', word: "capital", definition: "wealth in the form of money or other assets.", example: "Rates of return on invested capital.", topic: "Business", phonetic: "/ˈkapɪt(ə)l/", difficulty: 'medium' },
    { id: 'bus-23', word: "deficit", definition: "the amount by which something, especially a sum of money, is too small.", example: "An annual operating deficit.", topic: "Business", phonetic: "/ˈdɛfɪsɪt/", difficulty: 'hard' },
    { id: 'bus-24', word: "inflation", definition: "a general increase in prices and fall in the purchasing power of money.", example: "Policies to control inflation.", topic: "Business", phonetic: "/ɪnˈfleɪʃ(ə)n/", difficulty: 'medium' },
    { id: 'bus-25', word: "investment", definition: "the action or process of investing money for profit or material result.", example: "A private investment enterprise.", topic: "Business", phonetic: "/ɪnˈvɛs(t)m(ə)nt/", difficulty: 'medium' },
    { id: 'bus-26', word: "management", definition: "the process of dealing with or controlling things or people.", example: "The management of the economy.", topic: "Business", phonetic: "/ˈmanɪdʒm(ə)nt/", difficulty: 'easy' },
    { id: 'bus-27', word: "marketing", definition: "the action or business of promoting and selling products or services.", example: "Western methods of marketing.", topic: "Business", phonetic: "/ˈmɑːkɪtɪŋ/", difficulty: 'medium' },
    { id: 'bus-28', word: "monopoly", definition: "the exclusive possession or control of the supply or trade in a commodity or service.", example: "The state's monopoly of radio and television broadcasting.", topic: "Business", phonetic: "/məˈnɒp(ə)li/", difficulty: 'hard' },
    { id: 'bus-29', word: "negotiation", definition: "discussion aimed at reaching an agreement.", example: "A worldwide ban is currently under negotiation.", topic: "Business", phonetic: "/nɪˌɡəʊʃɪˈeɪʃ(ə)n/", difficulty: 'medium' },
    { id: 'bus-30', word: "output", definition: "the amount of something produced by a person, machine, or industry.", example: "Output from the mine ceased in May.", topic: "Business", phonetic: "/ˈaʊtpʊt/", difficulty: 'medium' },
    { id: 'bus-31', word: "personnel", definition: "people employed in an organization or engaged in an organized undertaking such as military service.", example: "Many of the personnel involved require training.", topic: "Business", phonetic: "/ˌpəːsəˈnɛl/", difficulty: 'medium' },
    { id: 'bus-32', word: "strategy", definition: "a plan of action or policy designed to achieve a major or overall aim.", example: "Time to develop a coherent economic strategy.", topic: "Business", phonetic: "/ˈstratɪdʒi/", difficulty: 'medium' },
    { id: 'bus-33', word: "subsidy", definition: "a sum of money granted by the government or a public body to assist an industry or business.", example: "A farm subsidy.", topic: "Business", phonetic: "/ˈsʌbsɪdi/", difficulty: 'hard' },
    { id: 'bus-34', word: "transaction", definition: "an instance of buying or selling something; a business deal.", example: "In an ordinary commercial transaction.", topic: "Business", phonetic: "/tranˈzakʃ(ə)n/", difficulty: 'medium' },
    { id: 'bus-35', word: "venture", definition: "a risky or daring journey or undertaking.", example: "Pioneering ventures into the little-known waters.", topic: "Business", phonetic: "/ˈvɛntʃə/", difficulty: 'medium' },

    // --- Topic: Society / Life ---
    { id: 'soc-1', word: "tenuous", definition: "very weak or slight.", example: "The tenuous link between the two.", topic: "Society", phonetic: "/ˈtɛnjʊəs/", difficulty: 'hard' },
    { id: 'soc-2', word: "vacuous", definition: "having or showing a lack of thought or intelligence; mindless.", example: "A vacuous smile.", topic: "Society", phonetic: "/ˈvakjʊəs/", difficulty: 'hard' },
    { id: 'soc-3', word: "churlish", definition: "rude in a mean-spirited and surly way.", example: "It seems churlish to complain.", topic: "Society", phonetic: "/ˈtʃəːlɪʃ/", difficulty: 'hard' },
    { id: 'soc-4', word: "celebrate", definition: "acknowledge (a significant or happy day or event) with a social gathering or enjoyable activity.", example: "They were celebrating their wedding anniversary.", topic: "Society", phonetic: "/ˈsɛlɪbreɪt/", difficulty: 'easy' },
    { id: 'soc-5', word: "companion", definition: "a person or animal with whom one spends a lot of time or with whom one travels.", example: "His travelling companion.", topic: "Society", phonetic: "/kəmˈpanjən/", difficulty: 'easy' },
    { id: 'soc-6', word: "privilege", definition: "a special right, advantage, or immunity granted or available only to a particular person or group.", example: "Education is a right, not a privilege.", topic: "Society", phonetic: "/ˈprɪvɪlɪdʒ/", difficulty: 'medium' },
    { id: 'soc-7', word: "scandal", definition: "an action or event regarded as morally or legally wrong and causing general public outrage.", example: "A bribery scandal.", topic: "Society", phonetic: "/ˈskand(ə)l/", difficulty: 'medium' },
    { id: 'soc-8', word: "immigrant", definition: "a person who comes to live permanently in a foreign country.", example: "Immigrant workers.", topic: "Society", phonetic: "/ˈɪmɪɡr(ə)nt/", difficulty: 'medium' },
    { id: 'soc-9', word: "heritage", definition: "property that is or may be inherited; an inheritance.", example: "Europe's cultural heritage.", topic: "Society", phonetic: "/ˈhɛrɪtɪdʒ/", difficulty: 'medium' },
    { id: 'soc-10', word: "tradition", definition: "the transmission of customs or beliefs from generation to generation.", example: "China's unique cultural traditions.", topic: "Society", phonetic: "/trəˈdɪʃ(ə)n/", difficulty: 'easy' },
    { id: 'soc-11', word: "celebrity", definition: "a famous person.", example: "A sports celebrity.", topic: "Society", phonetic: "/sɪˈlɛbrɪti/", difficulty: 'easy' },
    { id: 'soc-12', word: "humanity", definition: "the human race; human beings collectively.", example: "He praised the humanity of the soldiers.", topic: "Society", phonetic: "/hjuːˈmanɪti/", difficulty: 'medium' },
    { id: 'soc-13', word: "justice", definition: "just behavior or treatment.", example: "A concern for justice, peace, and genuine respect for people.", topic: "Society", phonetic: "/ˈdʒʌstɪs/", difficulty: 'easy' },
    { id: 'soc-14', word: "liberty", definition: "the state of being free within society from oppressive restrictions imposed by authority on one's way of life, behavior, or political views.", example: "Compulsory retirement interferes with individual liberty.", topic: "Society", phonetic: "/ˈlɪbəti/", difficulty: 'medium' },
    { id: 'soc-15', word: "community", definition: "a group of people living in the same place or having a particular characteristic in common.", example: "Rhode Island's Japanese community.", topic: "Society", phonetic: "/kəˈmjuːnɪti/", difficulty: 'easy' },
    { id: 'soc-16', word: "culture", definition: "the arts and other manifestations of human intellectual achievement regarded collectively.", example: "20th century popular culture.", topic: "Society", phonetic: "/ˈkʌltʃə/", difficulty: 'easy' },
    { id: 'soc-17', word: "generation", definition: "all of the people born and living at about the same time, regarded collectively.", example: "One of the brightest minds of his generation.", topic: "Society", phonetic: "/dʒɛnəˈreɪʃ(ə)n/", difficulty: 'easy' },
    { id: 'soc-18', word: "institution", definition: "a society or organization founded for a religious, educational, social, or similar purpose.", example: "A certificate from a professional institution.", topic: "Society", phonetic: "/ɪnstɪˈtjuːʃ(ə)n/", difficulty: 'medium' },
    { id: 'soc-19', word: "media", definition: "the main means of mass communication.", example: " The campaign won support from the media.", topic: "Society", phonetic: "/ˈmiːdɪə/", difficulty: 'easy' },
    { id: 'soc-20', word: "policy", definition: "a course or principle of action adopted or proposed by a government, party, business, or individual.", example: "The government's controversial economic policies.", topic: "Society", phonetic: "/ˈpɒlɪsi/", difficulty: 'easy' },
    { id: 'soc-21', word: "social", definition: "relating to society or its organization.", example: "Alcoholism is acknowledged as a major social problem.", topic: "Society", phonetic: "/ˈsəʊʃ(ə)l/", difficulty: 'easy' },
    { id: 'soc-22', word: "status", definition: "the relative social, professional, or other standing of someone or something.", example: "An improvement in the status of women.", topic: "Society", phonetic: "/ˈsteɪtəs/", difficulty: 'medium' },
    { id: 'soc-23', word: "welfare", definition: "the health, happiness, and fortunes of a person or group.", example: "They don't give a damn about the welfare of their families.", topic: "Society", phonetic: "/ˈwɛlfɛː/", difficulty: 'medium' },
    { id: 'soc-24', word: "citizen", definition: "a legally recognized subject or national of a state or commonwealth.", example: "A British citizen.", topic: "Society", phonetic: "/ˈsɪtɪz(ə)n/", difficulty: 'easy' },
    { id: 'soc-25', word: "civil", definition: "relating to ordinary citizens and their concerns.", example: "Civil aviation.", topic: "Society", phonetic: "/ˈsɪv(ə)l/", difficulty: 'medium' },
    { id: 'soc-26', word: "diversity", definition: "the state of being diverse; variety.", example: "There was considerable diversity in the style of the reports.", topic: "Society", phonetic: "/dʌɪˈvəːsɪti/", difficulty: 'medium' },
    { id: 'soc-27', word: "democracy", definition: "a system of government by the whole population or all the eligible members of a state.", example: "Capitalism and democracy are ascendant in the third world.", topic: "Society", phonetic: "/dɪˈmɒkrəsi/", difficulty: 'medium' },
    { id: 'soc-28', word: "global", definition: "relating to the whole world; worldwide.", example: "The downturn in the global economy.", topic: "Society", phonetic: "/ˈɡləʊb(ə)l/", difficulty: 'easy' },
    { id: 'soc-29', word: "issue", definition: "an important topic or problem for debate or discussion.", example: "The issue of global warming.", topic: "Society", phonetic: "/ˈɪʃuː/", difficulty: 'easy' },
    { id: 'soc-30', word: "migration", definition: "movement from one part of something to another.", example: "This migration of the population to the cities.", topic: "Society", phonetic: "/mʌɪˈɡreɪʃ(ə)n/", difficulty: 'medium' },
    { id: 'soc-31', word: "minority", definition: "the smaller number or part, especially a number that is less than half the whole number.", example: "A minority of people.", topic: "Society", phonetic: "/mʌɪˈnɒrɪti/", difficulty: 'medium' },
    { id: 'soc-32', word: "pollution", definition: "the presence in or introduction into the environment of a substance or thing that has harmful or poisonous effects.", example: "The level of pollution in the air is rising.", topic: "Society", phonetic: "/pəˈluːʃ(ə)n/", difficulty: 'easy' },
    { id: 'soc-33', word: "poverty", definition: "the state of being extremely poor.", example: "Thousands of families are living in abject poverty.", topic: "Society", phonetic: "/ˈpɒvəti/", difficulty: 'medium' },
    { id: 'soc-34', word: "regulation", definition: "a rule or directive made and maintained by an authority.", example: "Planning regulations.", topic: "Society", phonetic: "/rɛɡjʊˈleɪʃ(ə)n/", difficulty: 'medium' },
    { id: 'soc-35', word: "relationship", definition: "the way in which two or more concepts, objects, or people are connected, or the state of being connected.", example: "The study will assess the relationship between unemployment and political instability.", topic: "Society", phonetic: "/rɪˈleɪʃ(ə)nʃɪp/", difficulty: 'easy' },
    { id: 'soc-36', word: "resident", definition: "a person who lives somewhere permanently or on a long-term basis.", example: "It was a beautiful hamlet with just 100 residents.", topic: "Society", phonetic: "/ˈrɛzɪd(ə)nt/", difficulty: 'easy' },
    { id: 'soc-37', word: "rural", definition: "in, relating to, or characteristic of the countryside rather than the town.", example: "Remote rural areas.", topic: "Society", phonetic: "/ˈrʊər(ə)l/", difficulty: 'easy' },
    { id: 'soc-38', word: "sector", definition: "an area or portion that is distinct from others.", example: "Operations in the southern sector of the North Sea.", topic: "Society", phonetic: "/ˈsɛktə/", difficulty: 'medium' },
    { id: 'soc-39', word: "urban", definition: "in, relating to, or characteristic of a town or city.", example: "The urban population.", topic: "Society", phonetic: "/ˈəːb(ə)n/", difficulty: 'easy' },
    { id: 'soc-40', word: "violence", definition: "behavior involving physical force intended to hurt, damage, or kill someone or something.", example: "Violence against women.", topic: "Society", phonetic: "/ˈvʌɪələns/", difficulty: 'medium' },

    // --- Topic: Environment / Nature ---
    { id: 'env-1', word: "sustainable", definition: "able to be maintained at a certain rate or level.", example: "Sustainable economic growth.", topic: "Environment", phonetic: "/səˈsteɪnəb(ə)l/", difficulty: 'medium' },
    { id: 'env-2', word: "biodiversity", definition: "the variety of life in the world or in a particular habitat or ecosystem.", example: "A high level of biodiversity.", topic: "Environment", phonetic: "/fauna/", difficulty: 'medium' },
    { id: 'env-3', word: "landscape", definition: "all the visible features of an area of countryside or land.", example: "The giant cacti that dominate this landscape.", topic: "Environment", phonetic: "/ˈlandskeɪp/", difficulty: 'easy' },
    { id: 'env-4', word: "climate", definition: "the weather conditions prevailing in an area in general or over a long period.", example: "Our cold, wet climate.", topic: "Environment", phonetic: "/ˈklʌɪmət/", difficulty: 'easy' },
    { id: 'env-5', word: "conservation", definition: "prevention of wasteful use of a resource.", example: "Energy conservation.", topic: "Environment", phonetic: "/kɒnsəˈveɪʃ(ə)n/", difficulty: 'medium' },
    { id: 'env-6', word: "habitat", definition: "the natural home or environment of an animal, plant, or other organism.", example: "Wild chimpanzees in their natural habitat.", topic: "Environment", phonetic: "/ˈhabɪtat/", difficulty: 'medium' },
    { id: 'env-7', word: "erosion", definition: "the process of eroding or being eroded by wind, water, or other natural agents.", example: "The problem of soil erosion.", topic: "Environment", phonetic: "/ɪˈrəʊʒ(ə)n/", difficulty: 'medium' },
    { id: 'env-8', word: "glacier", definition: "a slowly moving mass or river of ice formed by the accumulation and compaction of snow on mountains or near the poles.", example: "The glacier melted significantly.", topic: "Environment", phonetic: "/ˈɡlaʃɪə/", difficulty: 'medium' },
    { id: 'env-9', word: "drought", definition: "a prolonged period of abnormally low rainfall.", example: "The cause of Europe's recent droughts.", topic: "Environment", phonetic: "/draʊt/", difficulty: 'medium' },
    { id: 'env-10', word: "agriculture", definition: "the science or practice of farming.", example: "Sustainable agriculture.", topic: "Environment", phonetic: "/ˈaɡrɪkʌltʃə/", difficulty: 'medium' },
    { id: 'env-11', word: "atmosphere", definition: "the envelope of gases surrounding the earth or another planet.", example: "Part of the sun's energy is absorbed by the earth's atmosphere.", topic: "Environment", phonetic: "/ˈatməsfɪə/", difficulty: 'easy' },
    { id: 'env-12', word: "carbon", definition: "the chemical element of atomic number 6, a nonmetal which has two main forms (diamond and graphite) and which also occurs in impure form in charcoal, soot, and coal.", example: "Carbon emissions.", topic: "Environment", phonetic: "/ˈkɑːb(ə)n/", difficulty: 'easy' },
    { id: 'env-13', word: "disaster", definition: "a sudden event, such as an accident or a natural catastrophe, that causes great damage or loss of life.", example: "A railway disaster.", topic: "Environment", phonetic: "/dɪˈzɑːstə/", difficulty: 'medium' },
    { id: 'env-14', word: "ecological", definition: "relating to or concerned with the relation of living organisms to one another and to their physical surroundings.", example: "An ecological disaster.", topic: "Environment", phonetic: "/iːkəˈlɒdʒɪk(ə)l/", difficulty: 'medium' },
    { id: 'env-15', word: "emission", definition: "the production and discharge of something, especially gas or radiation.", example: "The effects of lead emission on health.", topic: "Environment", phonetic: "/ɪˈmɪʃ(ə)n/", difficulty: 'medium' },
    { id: 'env-16', word: "extinction", definition: "the state or process of a species, family, or larger group being or becoming extinct.", example: " The extinction of the dinosaurs.", topic: "Environment", phonetic: "/ɪkˈstɪn(k)ʃ(ə)n/", difficulty: 'medium' },
    { id: 'env-17', word: "fertile", definition: "(of soil or land) producing or capable of producing abundant vegetation or crops.", example: "Fertile agricultural land.", topic: "Environment", phonetic: "/ˈfəːtʌɪl/", difficulty: 'medium' },
    { id: 'env-18', word: "harvest", definition: "the process or period of gathering in crops.", example: "Farmers busy with the harvest.", topic: "Environment", phonetic: "/ˈhɑːvɪst/", difficulty: 'easy' },
    { id: 'env-19', word: "irrigation", definition: "the supply of water to land or crops to help growth, typically by means of channels.", example: "The river supplies water for irrigation of agricultural crops.", topic: "Environment", phonetic: "/ɪrɪˈɡeɪʃ(ə)n/", difficulty: 'medium' },
    { id: 'env-20', word: "marine", definition: "of, found in, or produced by the sea.", example: "Marine plants.", topic: "Environment", phonetic: "/məˈriːn/", difficulty: 'medium' },
    { id: 'env-21', word: "resource", definition: "a stock or supply of money, materials, staff, and other assets that can be drawn on by a person or organization in order to function effectively.", example: "Local authorities complained that they lacked the resources.", topic: "Environment", phonetic: "/rɪˈzɔːs/", difficulty: 'easy' },
    { id: 'env-22', word: "species", definition: "a group of living organisms consisting of similar individuals capable of exchanging genes or interbreeding.", example: "Endangered species.", topic: "Environment", phonetic: "/ˈspiːʃiːz/", difficulty: 'medium' },
    { id: 'env-23', word: "vegetation", definition: "plants considered collectively, especially those found in a particular area or habitat.", example: "The chalk cliffs are mainly sheer with little vegetation.", topic: "Environment", phonetic: "/vɛdʒɪˈteɪʃ(ə)n/", difficulty: 'medium' },
    { id: 'env-24', word: "wildlife", definition: "wild animals collectively.", example: "The protection of wildlife.", topic: "Environment", phonetic: "/ˈwʌɪl(d)lʌɪf/", difficulty: 'easy' },
    { id: 'env-25', word: "adapt", definition: "make (something) suitable for a new use or purpose; modify.", example: "Hospitals have had to adapt to modern medical practice.", topic: "Environment", phonetic: "/əˈdapt/", difficulty: 'easy' },

    // --- Topic: Advanced Vocabulary (from wordsta) ---
    { id: 'adv-1', word: "vendetta", definition: "a blood feud between members of opposing parties", example: "Quarrels, murders, feuds, forays, vendettas... all these were in their repertory.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-2', word: "vivisection", definition: "the act of operating on living animals", example: "He revelled in anatomical demonstrations on animals, including gruesome public vivisections.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-3', word: "apposite", definition: "being of striking appropriateness and pertinence", example: "Foucault’s maxim is particularly apposite for critics.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-4', word: "bovine", definition: "dull and slow-moving and stolid", example: "The Lordsport men gazed on Theon with blank, bovine eyes.", topic: "Advanced", difficulty: 'medium' },
    { id: 'adv-5', word: "compliant", definition: "disposed to act in accordance with someone's wishes", example: "She resisted, she was confused, and then she was compliant.", topic: "Advanced", difficulty: 'medium' },
    { id: 'adv-6', word: "cosmology", definition: "the study of the evolution and structure of the universe", example: "According to the theory of inflationary cosmology.", topic: "Advanced", difficulty: 'medium' },
    { id: 'adv-7', word: "detraction", definition: "a petty disparagement", example: "Where I think many claims get it wrong is that these detractions also apply to other mediums.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-8', word: "dissonance", definition: "a conflict of people's opinions or actions or characters", example: "The viral response has combined a sudden uptick in civic responsibility with widespread dissonance.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-9', word: "doctrinaire", definition: "stubbornly insistent on theory rather than practicality", example: "There have been few times when its doctrinaire logic was more in need of tempering.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-10', word: "grandiloquent", definition: "lofty in style", example: "In a grandiloquent, newsreel-style voice, the show’s narrator began his report.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-11', word: "halcyon", definition: "idyllically calm and peaceful; suggesting happy tranquility", example: "His life in Southern California in the 1950s sounds in many ways halcyon.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-12', word: "inconsequential", definition: "lacking worth or importance", example: "Would it come into the world gossiping about inconsequential nothings?", topic: "Advanced", difficulty: 'medium' },
    { id: 'adv-13', word: "militate", definition: "have force or influence; bring about an effect or change", example: "Women claimed the power of witchcraft to militate against total male dominance.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-14', word: "misanthrope", definition: "someone who dislikes people in general", example: "He was too impatient with people and was basically a misanthrope.", topic: "Advanced", difficulty: 'medium' },
    { id: 'adv-15', word: "pellucid", definition: "transparently clear; easily understandable", example: "He has done this in a breezy, pellucid manner.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-16', word: "rococo", definition: "having excessive asymmetrical ornamentation", example: "The cuffs and collars could use more rococo ornamentation.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-17', word: "shard", definition: "a broken piece of a brittle artifact", example: "The glass bowl shattered, leaving me with a jagged sickle of a shard.", topic: "Advanced", difficulty: 'medium' },
    { id: 'adv-18', word: "stultify", definition: "deprive of strength or efficiency; make useless or worthless", example: "My father has grounded me to stultify my life.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-19', word: "toady", definition: "a person who tries to please someone to gain an advantage", example: "Her toadies and allies of convenience are unsure where the power lies now.", topic: "Advanced", difficulty: 'medium' },
    { id: 'adv-20', word: "turgid", definition: "ostentatiously lofty in style", example: "Was this the only true history of the times, a song with turgid, inadequate words?", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-21', word: "veracious", definition: "habitually speaking the truth", example: "A painfully veracious observation on contemporary texting behavior.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-22', word: "viscous", definition: "having a relatively high resistance to flow", example: "The clay was shoveled into one of the pits and water mixed in to form a thick viscous mud.", topic: "Advanced", difficulty: 'medium' },
    { id: 'adv-23', word: "abscission", definition: "the act of cutting something off", example: "The painful abscission has been made.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-24', word: "accretion", definition: "an increase by natural growth or addition", example: "Two wings had been added to accommodate the yearly accretions.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-25', word: "anodyne", definition: "a medicine used to relieve pain", example: "They provided us deep pleasure, an anodyne to the squalor of the street.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-26', word: "atavism", definition: "a reappearance of an earlier characteristic", example: "They think illiberal authoritarianism is the wave of the future, not an atavism from the past.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-27', word: "cantankerous", definition: "having a difficult and contrary disposition", example: "Both artists were becoming more cantankerous with age.", topic: "Advanced", difficulty: 'medium' },
    { id: 'adv-28', word: "chicanery", definition: "the use of tricks to deceive someone", example: "Phenomena that Western culture classifies as chicanery or nonsense.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-29', word: "demotic", definition: "of or for the common people", example: "His street photography consists of fluent shots of a demotic New York.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-30', word: "diaphanous", definition: "so thin as to transmit light", example: "Her palm was pale, almost diaphanous.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-31', word: "factotum", definition: "a servant employed to do a variety of jobs", example: "Your new phone will become your constant companion and trusty factotum.", topic: "Advanced", difficulty: 'medium' },
    { id: 'adv-32', word: "impecunious", definition: "not having enough money to pay for necessities", example: "Impecunious American universities pressed for endowments.", topic: "Advanced", difficulty: 'medium' },
    { id: 'adv-33', word: "internecine", definition: "characterized by bloodshed and carnage for both sides", example: "Ants clash in internecine warfare.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-34', word: "olfactory", definition: "of or relating to the sense of smell", example: "It came to my olfactory sense, full and fresh.", topic: "Advanced", difficulty: 'medium' },
    { id: 'adv-35', word: "plutocracy", definition: "a political system governed by the wealthy people", example: "The promise of power that can only create a corrupt plutocracy.", topic: "Advanced", difficulty: 'medium' },
    { id: 'adv-36', word: "reprise", definition: "repeat, renew, or resume some action", example: "A springboard to reprising Japan’s 1960s boom.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-37', word: "salubrious", definition: "promoting health", example: "People who take up one healthy habit tend to practice other salubrious habits.", topic: "Advanced", difficulty: 'medium' },
    { id: 'adv-38', word: "Stygian", definition: "dark and dismal as of the river in Hades", example: "Crossing a walled river of Stygian sludge.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-39', word: "timbre", definition: "the distinctive property of a complex sound", example: "They explore the timbre of whatever instrument or voice.", topic: "Advanced", difficulty: 'medium' },
    { id: 'adv-40', word: "bacchanalian", definition: "used of riotously drunken merrymaking", example: "Celebrations derived from the bacchanalian excesses.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-41', word: "bawdy", definition: "humorously vulgar", example: "War was a wild, bawdy place of dance halls.", topic: "Advanced", difficulty: 'medium' },
    { id: 'adv-42', word: "bedizen", definition: "decorate tastelessly", example: "Beneath the swirling tattoos and bedizened robes.", topic: "Advanced", difficulty: 'hard' },
    {
        id: 'adv-43',
        word: "cadge",
        definition: "ask or beg for something and get it for free",
        example: "I would cadge extras from the children.",
        topic: "Advanced",
        difficulty: 'hard'
    },
    { id: 'adv-44', word: "carping", definition: "persistent petty and unjustified criticism", example: "Despite the carping of younger critics.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-45', word: "cornucopia", definition: "the property of being extremely abundant", example: "A cornucopia of cheeses, olives, oils.", topic: "Advanced", difficulty: 'medium' },
    { id: 'adv-46', word: "evocative", definition: "serving to bring to mind", example: "Food souvenirs are evocative of people and places.", topic: "Advanced", difficulty: 'medium' },
    { id: 'adv-47', word: "extemporaneous", definition: "with little or no preparation or forethought", example: "Breathless extemporaneous monologues.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-48', word: "gauche", definition: "lacking social poise or refinement", example: "It would be gauche to mention it.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-49', word: "pusillanimous", definition: "lacking in courage, strength, and resolution", example: "A courageous scoundrel is far worse than a pusillanimous one.", topic: "Advanced", difficulty: 'hard' },
    { id: 'adv-50', word: "quagmire", definition: "a situation from which extrication is difficult", example: "Stuck in a deep quagmire of indifference.", topic: "Advanced", difficulty: 'medium' }
];

export const TOPICS = Array.from(new Set(VOCAB_DATA.map(w => w.topic)));
