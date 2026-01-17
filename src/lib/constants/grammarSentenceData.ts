export interface SentenceData {
    sentence: string;
    translation: string;
}

export const GRAMMAR_SENTENCE_DATA: Record<string, SentenceData[]> = {
    // ==================== TENSES (12) ====================
    // 1. Present Simple
    'present-simple': [
        { sentence: "I play soccer.", translation: "Tôi chơi bóng đá." },
        { sentence: "She loves cats.", translation: "Cô ấy yêu mèo." },
        { sentence: "We go to school.", translation: "Chúng tôi đi học." },
        { sentence: "He does not work.", translation: "Anh ấy không làm việc." },
        { sentence: "Do you like pizza?", translation: "Bạn có thích pizza không?" },
        { sentence: "The sun rises in the east.", translation: "Mặt trời mọc ở hướng đông." },
        { sentence: "My mother cooks dinner every day.", translation: "Mẹ tôi nấu bữa tối mỗi ngày." },
        { sentence: "They usually play tennis on Sundays.", translation: "Họ thường chơi quần vợt vào Chủ nhật." },
        { sentence: "He never forgets to do his homework.", translation: "Anh ấy không bao giờ quên làm bài tập về nhà." },
        { sentence: "Water boils at one hundred degrees Celsius.", translation: "Nước sôi ở một trăm độ C." }
    ],
    // 2. Present Continuous
    'present-continuous': [
        { sentence: "I am eating.", translation: "Tôi đang ăn." },
        { sentence: "She is sleeping.", translation: "Cô ấy đang ngủ." },
        { sentence: "They are playing.", translation: "Họ đang chơi." },
        { sentence: "It is raining now.", translation: "Bây giờ trời đang mưa." },
        { sentence: "Are you listening?", translation: "Bạn có đang nghe không?" },
        { sentence: "We are studying English at the moment.", translation: "Chúng tôi đang học tiếng Anh vào lúc này." },
        { sentence: "He is not watching TV right now.", translation: "Anh ấy đang không xem TV ngay lúc này." },
        { sentence: "Look! The bus is coming.", translation: "Nhìn kìa! Xe buýt đang đến." },
        { sentence: "They are building a new house down the street.", translation: "Họ đang xây một ngôi nhà mới ở cuối phố." },
        { sentence: "Why is she always complaining about everything?", translation: "Tại sao cô ấy luôn phàn nàn về mọi thứ vậy?" }
    ],
    // 3. Present Perfect
    'present-perfect': [
        { sentence: "I have eaten.", translation: "Tôi đã ăn rồi." },
        { sentence: "She has left.", translation: "Cô ấy đã rời đi." },
        { sentence: "We have finished.", translation: "Chúng tôi đã làm xong." },
        { sentence: "Have you seen him?", translation: "Bạn có thấy anh ấy không?" },
        { sentence: "He has broken his leg.", translation: "Anh ấy đã bị gãy chân." },
        { sentence: "I have already cleaned my room.", translation: "Tôi đã dọn dẹp phòng của mình rồi." },
        { sentence: "She has not visited Paris yet.", translation: "Cô ấy vẫn chưa đến thăm Paris." },
        { sentence: "They have lived here for ten years.", translation: "Họ đã sống ở đây được mười năm." },
        { sentence: "We have just bought a new car.", translation: "Chúng tôi vừa mới mua một chiếc xe hơi mới." },
        { sentence: "Have you ever been to the United States?", translation: "Bạn đã bao giờ đến Hoa Kỳ chưa?" }
    ],
    // 4. Present Perfect Continuous
    'present-perfect-cont': [
        { sentence: "I have been waiting.", translation: "Tôi đã và đang đợi." },
        { sentence: "It has been raining.", translation: "Trời đã và đang mưa." },
        { sentence: "She has been crying.", translation: "Cô ấy đã và đang khóc." },
        { sentence: "We have been working.", translation: "Chúng tôi đã và đang làm việc." },
        { sentence: "He has been sleeping.", translation: "Anh ấy đã và đang ngủ." },
        { sentence: "I have been learning English for two years.", translation: "Tôi đã học tiếng Anh được hai năm." },
        { sentence: "They have been playing games all day.", translation: "Họ đã chơi game cả ngày." },
        { sentence: "She has been waiting for you since morning.", translation: "Cô ấy đã đợi bạn từ sáng." },
        { sentence: "How long have you been living here?", translation: "Bạn đã sống ở đây bao lâu rồi?" },
        { sentence: "We have been trying to fix this problem for hours.", translation: "Chúng tôi đã cố gắng sửa vấn đề này hàng giờ liền." }
    ],
    // 5. Past Simple
    'past-simple': [
        { sentence: "I saw him.", translation: "Tôi đã thấy anh ấy." },
        { sentence: "She cooked dinner.", translation: "Cô ấy đã nấu bữa tối." },
        { sentence: "We went home.", translation: "Chúng tôi đã về nhà." },
        { sentence: "He did not come.", translation: "Anh ấy đã không đến." },
        { sentence: "Did you buy it?", translation: "Bạn đã mua nó chưa?" },
        { sentence: "I visited my grandmother yesterday.", translation: "Tôi đã thăm bà tôi hôm qua." },
        { sentence: "They lived in London in 2010.", translation: "Họ đã sống ở London vào năm 2010." },
        { sentence: "She wrote a letter to her friend.", translation: "Cô ấy đã viết một lá thư cho bạn của mình." },
        { sentence: "We didn't enjoy the movie last night.", translation: "Chúng tôi đã không thích bộ phim tối qua." },
        { sentence: "When did you start learning English?", translation: "Bạn đã bắt đầu học tiếng Anh khi nào?" }
    ],
    // 6. Past Continuous
    'past-continuous': [
        { sentence: "I was sleeping.", translation: "Tôi đang ngủ (lúc đó)." },
        { sentence: "It was raining.", translation: "Trời đang mưa (lúc đó)." },
        { sentence: "They were eating.", translation: "Họ đang ăn (lúc đó)." },
        { sentence: "She was reading.", translation: "Cô ấy đang đọc sách (lúc đó)." },
        { sentence: "Were you working?", translation: "Bạn có đang làm việc không (lúc đó)?" },
        { sentence: "I was watching TV at 8 PM.", translation: "Tôi đang xem TV lúc 8 giờ tối." },
        { sentence: "He was cooking when I called.", translation: "Anh ấy đang nấu ăn khi tôi gọi." },
        { sentence: "They were playing soccer when it started to rain.", translation: "Họ đang chơi bóng đá thì trời bắt đầu mưa." },
        { sentence: "What were you doing yesterday morning?", translation: "Bạn đã làm gì vào sáng hôm qua?" },
        { sentence: "While I was walking, I found a wallet.", translation: "Khi tôi đang đi bộ, tôi tìm thấy một cái ví." }
    ],
    // 7. Past Perfect
    'past-perfect': [
        { sentence: "I had eaten.", translation: "Tôi đã ăn (trước đó)." },
        { sentence: "She had left.", translation: "Cô ấy đã rời đi (trước đó)." },
        { sentence: "We had finished.", translation: "Chúng tôi đã làm xong (trước đó)." },
        { sentence: "He had gone out.", translation: "Anh ấy đã ra ngoài (trước đó)." },
        { sentence: "Had you seen it?", translation: "Bạn đã thấy nó chưa (trước đó)?" },
        { sentence: "I had already left when he arrived.", translation: "Tôi đã rời đi khi anh ấy đến." },
        { sentence: "She realized she had lost her keys.", translation: "Cô ấy nhận ra mình đã làm mất chìa khóa." },
        { sentence: "The train had left before we got to the station.", translation: "Tàu đã rời đi trước khi chúng tôi đến nhà ga." },
        { sentence: "He said he had never met her before.", translation: "Anh ấy nói rằng anh ấy chưa bao giờ gặp cô ấy trước đây." },
        { sentence: "By the time I was 10, I had learned to swim.", translation: "Trước khi tôi 10 tuổi, tôi đã học bơi." }
    ],
    // 8. Past Perfect Continuous
    'past-perfect-cont': [
        { sentence: "I had been working.", translation: "Tôi đã làm việc (liên tục trước đó)." },
        { sentence: "It had been raining.", translation: "Trời đã mưa (liên tục trước đó)." },
        { sentence: "She had been crying.", translation: "Cô ấy đã khóc (liên tục trước đó)." },
        { sentence: "They had been waiting.", translation: "Họ đã đợi (liên tục trước đó)." },
        { sentence: "He had been running.", translation: "Anh ấy đã chạy (liên tục trước đó)." },
        { sentence: "I had been waiting for an hour before he came.", translation: "Tôi đã đợi một tiếng đồng hồ trước khi anh ấy đến." },
        { sentence: "She was tired because she had been working all day.", translation: "Cô ấy mệt vì cô ấy đã làm việc cả ngày." },
        { sentence: "They had been playing for two hours when the storm started.", translation: "Họ đã chơi được hai tiếng thì cơn bão bắt đầu." },
        { sentence: "How long had you been studying before the exam?", translation: "Bạn đã học bao lâu trước kỳ thi?" },
        { sentence: "The ground was wet because it had been raining all night.", translation: "Mặt đất ướt vì trời đã mưa cả đêm." }
    ],
    // 9. Future Simple
    'future-simple': [
        { sentence: "I will go.", translation: "Tôi sẽ đi." },
        { sentence: "It will rain.", translation: "Trời sẽ mưa." },
        { sentence: "She will come.", translation: "Cô ấy sẽ đến." },
        { sentence: "We will help.", translation: "Chúng tôi sẽ giúp." },
        { sentence: "Will you stay?", translation: "Bạn sẽ ở lại chứ?" },
        { sentence: "I will call you tomorrow morning.", translation: "Tôi sẽ gọi cho bạn vào sáng mai." },
        { sentence: "They will probably arrive late tonight.", translation: "Họ có thể sẽ đến muộn tối nay." },
        { sentence: "I promise I will not tell anyone.", translation: "Tôi hứa tôi sẽ không nói với ai." },
        { sentence: "Do you think she will like the gift?", translation: "Bạn có nghĩ cô ấy sẽ thích món quà không?" },
        { sentence: "If you ask him, he will help you.", translation: "Nếu bạn hỏi anh ấy, anh ấy sẽ giúp bạn." }
    ],
    // 10. Future (going to)
    'future-going-to': [
        { sentence: "I am going to eat.", translation: "Tôi định ăn." },
        { sentence: "It is going to rain.", translation: "Trời sắp mưa." },
        { sentence: "She is going to buy it.", translation: "Cô ấy định mua nó." },
        { sentence: "We are going to play.", translation: "Chúng tôi định chơi." },
        { sentence: "Are you going to leave?", translation: "Bạn định rời đi à?" },
        { sentence: "I am going to visit Paris next summer.", translation: "Tôi dự định sẽ thăm Paris vào mùa hè tới." },
        { sentence: "Look at the clouds! It is going to rain.", translation: "Nhìn mây kìa! Trời sắp mưa rồi." },
        { sentence: "They are going to build a new bridge here.", translation: "Họ dự định xây một cây cầu mới ở đây." },
        { sentence: "She is going to have a baby next month.", translation: "Cô ấy sắp sinh em bé vào tháng tới." },
        { sentence: "What are you going to do this weekend?", translation: "Bạn định làm gì vào cuối tuần này?" }
    ],
    // 11. Future Continuous
    'future-continuous': [
        { sentence: "I will be working.", translation: "Tôi sẽ đang làm việc." },
        { sentence: "She will be sleeping.", translation: "Cô ấy sẽ đang ngủ." },
        { sentence: "It will be raining.", translation: "Trời sẽ đang mưa." },
        { sentence: "They will be playing.", translation: "Họ sẽ đang chơi." },
        { sentence: "We will be waiting.", translation: "Chúng tôi sẽ đang đợi." },
        { sentence: "This time tomorrow, I will be flying to Tokyo.", translation: "Giờ này ngày mai, tôi sẽ đang bay đến Tokyo." },
        { sentence: "Don't call me at 8, I will be watching a movie.", translation: "Đừng gọi tôi lúc 8 giờ, tôi sẽ đang xem phim." },
        { sentence: "She will be studying when you arrive.", translation: "Cô ấy sẽ đang học khi bạn đến." },
        { sentence: "Will you be using the car this evening?", translation: "Bạn sẽ dùng xe hơi tối nay chứ?" },
        { sentence: "They will be having dinner when we get there.", translation: "Họ sẽ đang ăn tối khi chúng ta đến đó." }
    ],
    // 12. Future Perfect
    'future-perfect': [
        { sentence: "I will have finished.", translation: "Tôi sẽ làm xong." },
        { sentence: "She will have left.", translation: "Cô ấy sẽ rời đi." },
        { sentence: "We will have arrived.", translation: "Chúng tôi sẽ đến nơi." },
        { sentence: "He will have eaten.", translation: "Anh ấy sẽ ăn xong." },
        { sentence: "It will have stopped.", translation: "Nó sẽ dừng lại." },
        { sentence: "By next week, I will have finished this book.", translation: "Trước tuần sau, tôi sẽ đọc xong cuốn sách này." },
        { sentence: "She will have graduated by the end of this year.", translation: "Cô ấy sẽ tốt nghiệp trước cuối năm nay." },
        { sentence: "They will have been married for 20 years next month.", translation: "Họ sẽ kết hôn được 20 năm vào tháng tới." },
        { sentence: "I will have saved enough money by then.", translation: "Tôi sẽ tiết kiệm đủ tiền vào lúc đó." },
        { sentence: "Do you think we will have arrived by 5 PM?", translation: "Bạn có nghĩ chúng ta sẽ đến nơi trước 5 giờ chiều không?" }
    ],

    // ==================== STRUCTURES (8) ====================
    // 13. Passive Voice
    'passive-voice': [
        { sentence: "Rice is grown here.", translation: "Lúa được trồng ở đây." },
        { sentence: "The car was stolen.", translation: "Chiếc xe đã bị đánh cắp." },
        { sentence: "The house is being built.", translation: "Ngôi nhà đang được xây dựng." },
        { sentence: "The Letter has been sent.", translation: "Bức thư đã được gửi đi." },
        { sentence: "English is spoken all over the world.", translation: "Tiếng Anh được nói trên toàn thế giới." },
        { sentence: "The room was cleaned yesterday by my sister.", translation: "Căn phòng đã được dọn dẹp hôm qua bởi chị gái tôi." },
        { sentence: "This cake was made with fresh ingredients.", translation: "Cái bánh này được làm từ nguyên liệu tươi." },
        { sentence: "The decision will be made tomorrow morning.", translation: "Quyết định sẽ được đưa ra vào sáng mai." },
        { sentence: "Have the invitations been sent yet?", translation: "Thiệp mời đã được gửi đi chưa?" },
        { sentence: "The bridge is believed to be very old.", translation: "Cây cầu được tin là rất cổ." }
    ],
    // 14. Conditionals
    'conditionals': [
        { sentence: "If it rains, stay home.", translation: "Nếu trời mưa, hãy ở nhà." },
        { sentence: "If I study, I pass.", translation: "Nếu tôi học, tôi đỗ." },
        { sentence: "If he calls, tell him.", translation: "Nếu anh ấy gọi, hãy bảo anh ấy." },
        { sentence: "If I were you, I would go.", translation: "Nếu tôi là bạn, tôi sẽ đi." },
        { sentence: "If it rains tomorrow, we will cancel the picnic.", translation: "Nếu ngày mai trời mưa, chúng tôi sẽ hủy buổi dã ngoại." },
        { sentence: "If I had money, I would buy that car.", translation: "Nếu tôi có tiền, tôi sẽ mua chiếc xe đó." },
        { sentence: "If she knew the answer, she would tell us.", translation: "Nếu cô ấy biết câu trả lời, cô ấy sẽ nói cho chúng ta." },
        { sentence: "If I had known, I would have helped you.", translation: "Nếu tôi biết, tôi đã giúp bạn rồi." },
        { sentence: "Unless you hurry, you will miss the bus.", translation: "Trừ khi bạn nhanh lên, bạn sẽ lỡ xe buýt." },
        { sentence: "If you heat ice, it melts.", translation: "Nếu bạn đun nóng đá, nó sẽ tan chảy." }
    ],
    // 15. Relative Clauses
    'relative-clauses': [
        { sentence: "The man who called is nice.", translation: "Người đàn ông đã gọi rất tử tế." },
        { sentence: "This is the book that I like.", translation: "Đây là cuốn sách mà tôi thích." },
        { sentence: "The girl whose bag is red is my sister.", translation: "Cô gái có cái túi đỏ là em gái tôi." },
        { sentence: "I know a place where we can eat.", translation: "Tôi biết một nơi mà chúng ta có thể ăn." },
        { sentence: "Do you know the woman who is talking to Tom?", translation: "Bạn có biết người phụ nữ đang nói chuyện với Tom không?" },
        { sentence: "The car which he bought is very expensive.", translation: "Chiếc xe mà anh ấy mua rất đắt." },
        { sentence: "That is the house where I was born.", translation: "Đó là ngôi nhà nơi tôi sinh ra." },
        { sentence: "He is the person who helped me yesterday.", translation: "Anh ấy là người đã giúp tôi hôm qua." },
        { sentence: "The movie that we watched was boring.", translation: "Bộ phim mà chúng ta xem thật nhàm chán." },
        { sentence: "This is the reason why I came here.", translation: "Đây là lý do tại sao tôi đến đây." }
    ],
    // 16. Reported Speech
    'reported-speech': [
        { sentence: "He said he was happy.", translation: "Anh ấy nói anh ấy hạnh phúc." },
        { sentence: "She told me to wait.", translation: "Cô ấy bảo tôi đợi." },
        { sentence: "They said they were busy.", translation: "Họ nói họ đang bận." },
        { sentence: "He asked where I lived.", translation: "Anh ấy hỏi tôi sống ở đâu." },
        { sentence: "She said she liked chocolate.", translation: "Cô ấy nói cô ấy thích sô cô la." },
        { sentence: "Tom said he had visited London twice.", translation: "Tom nói anh ấy đã đến thăm London hai lần." },
        { sentence: "She asked me if I could help her.", translation: "Cô ấy hỏi tôi liệu tôi có thể giúp cô ấy không." },
        { sentence: "He told me not to open the door.", translation: "Anh ấy bảo tôi đừng mở cửa." },
        { sentence: "They said they would come the next day.", translation: "Họ nói họ sẽ đến vào ngày hôm sau." },
        { sentence: "My mother asked what I was doing.", translation: "Mẹ tôi hỏi tôi đang làm gì." }
    ],
    // 17. Question Tags
    'question-tags': [
        { sentence: "It is hot, isn't it?", translation: "Trời nóng, phải không?" },
        { sentence: "You are a student, aren't you?", translation: "Bạn là học sinh, phải không?" },
        { sentence: "She doesn't like it, does she?", translation: "Cô ấy không thích nó, phải không?" },
        { sentence: "They have left, haven't they?", translation: "Họ đã đi rồi, phải không?" },
        { sentence: "He can swim, can't he?", translation: "Anh ấy biết bơi, phải không?" },
        { sentence: "You didn't see him, did you?", translation: "Bạn đã không thấy anh ấy, phải không?" },
        { sentence: "We should go, shouldn't we?", translation: "Chúng ta nên đi, phải không?" },
        { sentence: "Let's go for a walk, shall we?", translation: "Chúng ta đi dạo nhé?" },
        { sentence: "Nobody is here, are they?", translation: "Không có ai ở đây, phải không?" },
        { sentence: "I am late, aren't I?", translation: "Tôi bị muộn, phải không?" }
    ],
    // 18. Indirect Questions
    'indirect-questions': [
        { sentence: "Do you know who he is?", translation: "Bạn có biết anh ấy là ai không?" },
        { sentence: "Can you tell me where it is?", translation: "Bạn có thể cho tôi biết nó ở đâu không?" },
        { sentence: "I wonder why she is crying.", translation: "Tôi tự hỏi tại sao cô ấy lại khóc." },
        { sentence: "Do you know what time it is?", translation: "Bạn có biết bây giờ là mấy giờ không?" },
        { sentence: "Could you tell me how much this costs?", translation: "Bạn có thể cho biết cái này giá bao nhiêu không?" },
        { sentence: "I don't know where the station is.", translation: "Tôi không biết nhà ga ở đâu." },
        { sentence: "Do you have any idea when they arrive?", translation: "Bạn có biết khi nào họ đến không?" },
        { sentence: "Can you explain how this machine works?", translation: "Bạn có thể giải thích máy này hoạt động thế nào không?" },
        { sentence: "I was wondering if you could help me.", translation: "Tôi tự hỏi liệu bạn có thể giúp tôi không." },
        { sentence: "She asked where the bathroom was.", translation: "Cô ấy hỏi nhà vệ sinh ở đâu." }
    ],
    // 19. Comparatives & Superlatives
    'comparatives': [
        { sentence: "He is taller than me.", translation: "Anh ấy cao hơn tôi." },
        { sentence: "This car is faster.", translation: "Chiếc xe này nhanh hơn." },
        { sentence: "She is the smartest student.", translation: "Cô ấy là học sinh thông minh nhất." },
        { sentence: "It is better than nothing.", translation: "Nó tốt hơn là không có gì." },
        { sentence: "This is the most expensive hotel.", translation: "Đây là khách sạn đắt nhất." },
        { sentence: "He drives more carefully than his brother.", translation: "Anh ấy lái xe cẩn thận hơn anh trai mình." },
        { sentence: "This is the worst movie I have ever seen.", translation: "Đây là bộ phim tệ nhất tôi từng xem." },
        { sentence: "Summer is hotter than winter.", translation: "Mùa hè nóng hơn mùa đông." },
        { sentence: "She is as beautiful as her mother.", translation: "Cô ấy đẹp như mẹ của mình." },
        { sentence: "The more you study, the smarter you get.", translation: "Bạn càng học nhiều, bạn càng thông minh hơn." }
    ],
    // 20. Wish & If only
    'wish-if-only': [
        { sentence: "I wish I were rich.", translation: "Tôi ước tôi giàu có." },
        { sentence: "If only I knew.", translation: "Giá như tôi biết." },
        { sentence: "I wish it would stop raining.", translation: "Tôi ước trời ngừng mưa." },
        { sentence: "She wishes she could fly.", translation: "Cô ấy ước cô ấy có thể bay." },
        { sentence: "If only I had more time.", translation: "Giá như tôi có nhiều thời gian hơn." },
        { sentence: "I wish I hadn't eaten so much.", translation: "Tôi ước tôi đã không ăn quá nhiều." },
        { sentence: "If only you were here with me.", translation: "Giá như bạn ở đây với tôi." },
        { sentence: "He wishes he had accepted the job.", translation: "Anh ấy ước mình đã nhận công việc đó." },
        { sentence: "I wish you wouldn't make so much noise.", translation: "Tôi ước bạn đừng gây ồn ào như vậy." },
        { sentence: "If only I could turn back time.", translation: "Giá như tôi có thể quay ngược thời gian." }
    ],

    // ==================== VERBS (6) ====================
    // 21. Modal Verbs
    'modal-verbs': [
        { sentence: "I can swim.", translation: "Tôi có thể bơi." },
        { sentence: "You must go.", translation: "Bạn phải đi." },
        { sentence: "She might come.", translation: "Cô ấy có thể sẽ đến." },
        { sentence: "You should study.", translation: "Bạn nên học." },
        { sentence: "May I sit here?", translation: "Tôi có thể ngồi đây không?" },
        { sentence: "You don't have to pay for this.", translation: "Bạn không cần phải trả tiền cho cái này." },
        { sentence: "He could run very fast when he was young.", translation: "Anh ấy có thể chạy rất nhanh khi còn trẻ." },
        { sentence: "We really ought to leave now.", translation: "Chúng ta thực sự nên rời đi ngay bây giờ." },
        { sentence: "You mustn't smoke in the hospital.", translation: "Bạn không được phép hút thuốc trong bệnh viện." },
        { sentence: "I would like to order a coffee.", translation: "Tôi muốn gọi một ly cà phê." }
    ],
    // 22. Gerunds & Infinitives
    'gerunds-infinitives': [
        { sentence: "I like swimming.", translation: "Tôi thích bơi." },
        { sentence: "I want to go.", translation: "Tôi muốn đi." },
        { sentence: "She enjoys dancing.", translation: "Cô ấy thích khiêu vũ." },
        { sentence: "He decided to stay.", translation: "Anh ấy đã quyết định ở lại." },
        { sentence: "Stop talking please.", translation: "Làm ơn ngừng nói chuyện." },
        { sentence: "I promise to help you.", translation: "Tôi hứa sẽ giúp bạn." },
        { sentence: "They avoided meeting him.", translation: "Họ đã tránh gặp anh ấy." },
        { sentence: "It is important to learn English.", translation: "Học tiếng Anh rất quan trọng." },
        { sentence: "I look forward to seeing you.", translation: "Tôi mong được gặp bạn." },
        { sentence: "She refused to answer the question.", translation: "Cô ấy từ chối trả lời câu hỏi." }
    ],
    // 23. Phrasal Verbs
    'phrasal-verbs': [
        { sentence: "Give up smoking.", translation: "Hãy bỏ thuốc lá." },
        { sentence: "Put on your coat.", translation: "Mặc áo khoác vào." },
        { sentence: "The plane took off.", translation: "Máy bay đã cất cánh." },
        { sentence: "I grew up here.", translation: "Tôi đã lớn lên ở đây." },
        { sentence: "Please turn off the light.", translation: "Làm ơn tắt đèn." },
        { sentence: "She gets along with her brother.", translation: "Cô ấy hòa thuận với anh trai." },
        { sentence: "I am looking for my keys.", translation: "Tôi đang tìm chìa khóa của mình." },
        { sentence: "Don't let me down.", translation: "Đừng làm tôi thất vọng." },
        { sentence: "They ran out of gas.", translation: "Họ đã hết xăng." },
        { sentence: "We must carry on working.", translation: "Chúng ta phải tiếp tục làm việc." }
    ],
    // 24. Irregular Verbs
    'irregular-verbs': [
        { sentence: "I went to school.", translation: "Tôi đã đi học." },
        { sentence: "She bought a car.", translation: "Cô ấy đã mua một chiếc xe." },
        { sentence: "He came late.", translation: "Anh ấy đã đến muộn." },
        { sentence: "They ate dinner.", translation: "Họ đã ăn tối." },
        { sentence: "We swam in the lake.", translation: "Chúng tôi đã bơi trong hồ." },
        { sentence: "I saw a movie yesterday.", translation: "Tôi đã xem một bộ phim hôm qua." },
        { sentence: "She wrote a beautiful poem.", translation: "Cô ấy đã viết một bài thơ đẹp." },
        { sentence: "He broke the window.", translation: "Anh ấy đã làm vỡ cửa sổ." },
        { sentence: "Have you chosen a dress?", translation: "Bạn đã chọn được váy chưa?" },
        { sentence: "The bird flew away.", translation: "Con chim đã bay đi." }
    ],
    // 25. Causative Verbs
    'causative-verbs': [
        { sentence: "I had my hair cut.", translation: "Tôi đã đi cắt tóc." },
        { sentence: "He got his car fixed.", translation: "Anh ấy đã đem sửa xe." },
        { sentence: "She let me go.", translation: "Cô ấy để tôi đi." },
        { sentence: "He made me cry.", translation: "Anh ấy đã làm tôi khóc." },
        { sentence: "I will have him call you.", translation: "Tôi sẽ bảo anh ấy gọi cho bạn." },
        { sentence: "She got her brother to help her.", translation: "Cô ấy đã nhờ anh trai giúp mình." },
        { sentence: "The teacher made us study hard.", translation: "Giáo viên bắt chúng tôi học chăm chỉ." },
        { sentence: "My parents let me go to the party.", translation: "Bố mẹ đã cho phép tôi đi dự tiệc." },
        { sentence: "We had the house painted last week.", translation: "Chúng tôi đã thuê sơn nhà tuần trước." },
        { sentence: "Can you help me get this computer working?", translation: "Bạn có thể giúp tôi làm cái máy tính này hoạt động không?" }
    ],
    // 26. Used to / Would / Be used to
    'used-to': [
        { sentence: "I used to smoke.", translation: "Tôi đã từng hút thuốc." },
        { sentence: "I am used to the noise.", translation: "Tôi đã quen với tiếng ồn." },
        { sentence: "He would visit us often.", translation: "Anh ấy thường đến thăm chúng tôi." },
        { sentence: "She used to live here.", translation: "Cô ấy đã từng sống ở đây." },
        { sentence: "Are you used to driving?", translation: "Bạn đã quen lái xe chưa?" },
        { sentence: "I am getting used to my new job.", translation: "Tôi đang dần quen với công việc mới." },
        { sentence: "My grandfather would tell us stories.", translation: "Ông tôi thường kể chuyện cho chúng tôi nghe." },
        { sentence: "Did you use to play football?", translation: "Bạn có từng chơi bóng đá không?" },
        { sentence: "It took me a while to get used to the food.", translation: "Tôi mất một lúc để làm quen với đồ ăn." },
        { sentence: "She didn't use to like coffee, but now she does.", translation: "Cô ấy từng không thích cà phê, nhưng giờ thì có." }
    ],

    // ==================== OTHERS (4) ====================
    // 27. Articles
    'articles': [
        { sentence: "I have a cat.", translation: "Tôi có một con mèo." },
        { sentence: "The sun is hot.", translation: "Mặt trời thì nóng." },
        { sentence: "She ate an apple.", translation: "Cô ấy đã ăn một quả táo." },
        { sentence: "Dogs are loyal.", translation: "Chó rất trung thành." },
        { sentence: "The book on the table is mine.", translation: "Quyển sách trên bàn là của tôi." },
        { sentence: "I want to be a doctor.", translation: "Tôi muốn trở thành bác sĩ." },
        { sentence: "The moon goes around the earth.", translation: "Mặt trăng quay quanh trái đất." },
        { sentence: "He goes to school by bus.", translation: "Anh ấy đi học bằng xe buýt." },
        { sentence: "She is the best student in class.", translation: "Cô ấy là học sinh giỏi nhất lớp." },
        { sentence: "Paris is the capital of France.", translation: "Paris là thủ đô của Pháp." }
    ],
    // 28. Prepositions
    'prepositions': [
        { sentence: "The book is on the table.", translation: "Cuốn sách ở trên bàn." },
        { sentence: "She lives in London.", translation: "Cô ấy sống ở London." },
        { sentence: "We meet at 5 PM.", translation: "Chúng ta gặp nhau lúc 5 giờ chiều." },
        { sentence: "He walked into the room.", translation: "Anh ấy đi vào phòng." },
        { sentence: "The cat is under the bed.", translation: "Con mèo ở dưới gầm giường." },
        { sentence: "I am interested in music.", translation: "Tôi hứng thú với âm nhạc." },
        { sentence: "This gift is for you.", translation: "Món quà này là cho bạn." },
        { sentence: "He jumped over the fence.", translation: "Anh ấy đã nhảy qua hàng rào." },
        { sentence: "We are waiting for the bus.", translation: "Chúng tôi đang đợi xe buýt." },
        { sentence: "The picture is on the wall.", translation: "Bức tranh ở trên tường." }
    ],
    // 29. Quantifiers
    'quantifiers': [
        { sentence: "I have some money.", translation: "Tôi có một ít tiền." },
        { sentence: "Do you have any questions?", translation: "Bạn có câu hỏi nào không?" },
        { sentence: "There are many people here.", translation: "Có nhiều người ở đây." },
        { sentence: "We have a lot of time.", translation: "Chúng ta có nhiều thời gian." },
        { sentence: "There is a little water left.", translation: "Còn lại một ít nước." },
        { sentence: "Few students passed the exam.", translation: "Rất ít học sinh đỗ kỳ thi." },
        { sentence: "How much sugar do you want?", translation: "Bạn muốn bao nhiêu đường?" },
        { sentence: "I don't have enough money.", translation: "Tôi không có đủ tiền." },
        { sentence: "All of the students are here.", translation: "Tất cả học sinh đều ở đây." },
        { sentence: "Neither of them came to the party.", translation: "Không ai trong số họ đến bữa tiệc." }
    ],
    // 30. Word Order
    'word-order': [
        { sentence: "I always drink coffee.", translation: "Tôi luôn uống cà phê." },
        { sentence: "She speaks English well.", translation: "Cô ấy nói tiếng Anh giỏi." },
        { sentence: "Where do you live?", translation: "Bạn sống ở đâu?" },
        { sentence: "He bought a new car yesterday.", translation: "Anh ấy đã mua một chiếc xe mới hôm qua." },
        { sentence: "I have never seen him before.", translation: "Tôi chưa bao giờ gặp anh ấy trước đây." },
        { sentence: "Slowly, the door opened.", translation: "Cánh cửa từ từ mở ra." },
        { sentence: "Do you usually go to bed early?", translation: "Bạn có thường đi ngủ sớm không?" },
        { sentence: "She quietly left the room.", translation: "Cô ấy lặng lẽ rời khỏi phòng." },
        { sentence: "My brother plays football in the park.", translation: "Anh trai tôi chơi bóng đá trong công viên." },
        { sentence: "I am not going to the party tonight.", translation: "Tôi sẽ không đi dự tiệc tối nay." }
    ]
};
