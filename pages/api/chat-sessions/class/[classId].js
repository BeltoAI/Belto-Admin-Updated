import dbConnect from '@/lib/dbConnect';
import ChatSession from '@/models/Chat';
import Lecture from '@/models/Lecture';

// Helper function to extract sentiment data from messages
function analyzeSentiment(messages) {
  // Only consider messages from users, not from bots
  const userMessages = messages.filter(msg => !msg.isBot);
  
  if (!userMessages || userMessages.length === 0) return { score: 0, comparative: 0 };
  
  // Calculate average sentiment score
  const totalSentiment = userMessages.reduce((sum, msg) => {
    // This is a placeholder - in a real app you would use NLP to calculate sentiment
    // For now we'll derive a mock score from the message content
    // Positive sentiment words - more than 50 words
    const hasPositive = msg.message.match(/\b(great|good|love|like|helpful|useful|thank|appreciate|amazing|excellent|outstanding|fantastic|wonderful|superb|brilliant|awesome|perfect|impressive|remarkable|exceptional|delightful|terrific|pleasant|positive|valuable|effective|efficient|beneficial|convenient|productive|successful|insightful|intuitive|innovative|inspiring|encouraging|supportive|engaging|exciting|fascinating|interesting|joyful|happy|glad|pleased|satisfied|enjoyable|clear|simple|easy|straightforward|elegant|clever|smart|quick|favorable|smooth|seamless|flawless|reliable|trustworthy|recommended|congratulations|well-done|bravo)\b/i);
    
    // Negative sentiment words - more than 50 words
    const hasNegative = msg.message.match(/\b(bad|confuse|difficult|hard|struggle|problem|issue|hate|dislike|awful|terrible|horrible|poor|disappointing|frustrating|annoying|irritating|useless|worthless|ineffective|inefficient|complicated|complex|confusing|unclear|vague|ambiguous|misleading|challenging|troublesome|problematic|faulty|defective|broken|unreliable|unstable|slow|laggy|buggy|glitchy|error|failure|crash|malfunction|mistake|wrong|incorrect|inaccurate|inadequate|insufficient|limited|restricted|inconvenient|cumbersome|tedious|boring|dull|uninteresting|unpleasant|uncomfortable|dissatisfied|unhappy|upset|angry|irritated|worried|concerned|troubled|stressful|overwhelming|exhausting|tiresome|pointless)\b/i);
    
    let score = 0;
    if (hasPositive && !hasNegative) score = Math.random() * 2 + 0.5; // 0.5 to 2.5
    else if (hasNegative && !hasPositive) score = -Math.random() * 2 - 0.5; // -0.5 to -2.5
    else if (hasPositive && hasNegative) score = Math.random() * 1.8 - 0.9; // -0.9 to 0.9
    
    return sum + score;
  }, 0);
  
  const score = userMessages.length > 0 ? totalSentiment / userMessages.length : 0;
  const comparative = score / 10; // Just a simplified comparative value
  
  return { score, comparative };
}

// Extract key topics and verbs from messages
function extractKeywords(messages) {
  // Only consider messages from users, not from bots
  const userMessages = messages.filter(msg => !msg.isBot);
  
  if (!userMessages || userMessages.length === 0) return { topics: [], verbs: [] };
  
  const topics = new Map();
  const verbs = new Map();
  
  userMessages.forEach(msg => {
    // In a real app, you would use NLP libraries like compromise or natural
    // Here we'll use simple pattern matching
    
    // Extract potential nouns (topics)
    const text = msg.message.toLowerCase();
    const potentialTopics = text.match(/\b(javascript|css|html|react|database|api|function|component|state|props|code|programming|variables|arrays|objects|algorithm|ajax|angular|animation|asynchronous|attribute|authentication|authorization|backend|bandwidth|binary|blockchain|boolean|bootstrap|browser|buffer|bug|cache|callback|canvas|class|client|closure|cloud|cluster|command|comment|compiler|complexity|compression|concurrency|conditional|configuration|console|constant|constructor|container|cookie|cpu|cryptography|data|debugging|declaration|decorator|deployment|design|destructuring|development|devops|directive|directory|dom|dynamic|element|encryption|endpoint|engine|enum|environment|error|eslint|event|exception|execution|expression|extension|external|filesystem|filter|firewall|flag|floating|flow|fork|form|framework|frontend|functional|garbage|generator|git|github|global|graph|grid|handler|hash|header|heap|hook|hosting|hoisting|http|https|ide|immutable|implementation|import|index|inheritance|injection|inline|input|instance|integration|interface|iteration|iterator|json|key|keyword|lambda|lazy|library|lifecycle|linked|lint|listener|literal|loader|local|logging|loop|machine|macro|manifest|mapping|markdown|markup|memory|meta|method|microservice|middleware|minification|mock|module|mvc|namespace|native|navigation|nested|network|node|notation|npm|null|number|object|observable|operator|optimization|output|overflow|package|parameter|parser|path|pattern|performance|permission|pixel|platform|plugin|pointer|polyfill|polymorphism|pool|port|preprocessor|primitive|priority|private|procedure|process|processor|production|profiler|promise|property|protocol|prototype|proxy|query|queue|recursion|redirect|reducer|reference|reflection|regex|registry|relational|rendering|repository|request|response|rest|router|runtime|sandbox|scope|script|security|selector|semantics|serialization|server|service|session|shadow|shell|signal|singleton|sitemap|socket|sorting|source|specification|sql|stack|standard|stateless|static|stream|string|structure|style|subclass|submitting|subscriber|superclass|svg|syntax|system|tag|task|template|terminal|testing|thread|token|transaction|transform|transition|transpiler|tree|trigger|tuple|type|typescript|ui|unit|uri|url|user|utility|validation|value|vanilla|variable|vector|version|viewport|virtual|visibility|visualisation|web|webpack|websocket|worker|workflow|wrapper|xml|yaml)\b/gi) || [];
    
    potentialTopics.forEach(topic => {
      topics.set(topic.toLowerCase(), (topics.get(topic.toLowerCase()) || 0) + 1);
    });
    
    // Extract potential verbs (actions)
    const potentialVerbs = text.match(/\b(learn|create|build|develop|understand|implement|code|design|struggle|help|fix|debug|analyze|solve|test|deploy|optimize|refactor|review|explore|discuss|explain|simplify|integrate|research|investigate|generate|identify|modify|update|configure|install|setup|initialize|verify|validate|document|define|maintain|support|troubleshoot|monitor|manage|automate|organize|plan|execute|evaluate|assess|compare|contrast|adapt|enhance|improve|upgrade|expand|extend|customize|adjust|transform|convert|migrate|transfer|process|handle|control|manipulate|retrieve|store|backup|restore|cache|load|save|edit|insert|delete|remove|add|subtract|multiply|divide|calculate|compute|compile|decompile|encrypt|decrypt|secure|protect|authenticate|authorize|register|login|logout|submit|cancel|approve|reject|accept|deny|prevent|allow|enable|disable|toggle|switch|start|stop|pause|resume|reboot|refresh|reload|reset|clear|clean|scan|search|find|locate|filter|sort|merge|split|combine|separate|isolate|connect|disconnect|link|unlink|bind|unbind|attach|detach|mount|unmount|interact|communicate|send|receive|publish|subscribe|broadcast|stream|record|play|parse|format|wrap|unwrap|pack|unpack|compress|decompress|archive|extract|import|export|read|write|open|close|print|display|render|animate|apply|visualize|prepare|access|respond|reply|confirm|track|measure|rate|classify|categorize|index|outline|draft|finalize|iterate|repeat|schedule|queue|prioritize|override|synchronize|asynchronize)\b/gi) || [];

    potentialVerbs.forEach(verb => {
      verbs.set(verb.toLowerCase(), (verbs.get(verb.toLowerCase()) || 0) + 1);
    });
  });
  
  // Convert to arrays sorted by frequency
  const topTopics = [...topics.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(item => item[0]);
    
  const topVerbs = [...verbs.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(item => item[0]);
  
  return { topics: topTopics, verbs: topVerbs };
}

// Process messages to add sentiment analysis
function processMessages(messages) {
  // To display all messages but indicate which are user vs bot
  return messages.map(msg => {
    const text = msg.message;
    
    // Extract nouns (topics)
    const nouns = (text.match(/\b(javascript|css|html|react|database|api|function|component|state|props|code|programming|variables|arrays|objects|algorithm|ajax|angular|animation|asynchronous|attribute|authentication|authorization|backend|bandwidth|binary|blockchain|boolean|bootstrap|browser|buffer|bug|cache|callback|canvas|class|client|closure|cloud|cluster|command|comment|compiler|complexity|compression|concurrency|conditional|configuration|console|constant|constructor|container|cookie|cpu|cryptography|data|debugging|declaration|decorator|deployment|design|destructuring|development|devops|directive|directory|dom|dynamic|element|encryption|endpoint|engine|enum|environment|error|eslint|event|exception|execution|expression|extension|external|filesystem|filter|firewall|flag|floating|flow|fork|form|framework|frontend|functional|garbage|generator|git|github|global|graph|grid|handler|hash|header|heap|hook|hosting|hoisting|http|https|ide|immutable|implementation|import|index|inheritance|injection|inline|input|instance|integration|interface|iteration|iterator|json|key|keyword|lambda|lazy|library|lifecycle|linked|lint|listener|literal|loader|local|logging|loop|machine|macro|manifest|mapping|markdown|markup|memory|meta|method|microservice|middleware|minification|mock|module|mvc|namespace|native|navigation|nested|network|node|notation|npm|null|number|object|observable|operator|optimization|output|overflow|package|parameter|parser|path|pattern|performance|permission|pixel|platform|plugin|pointer|polyfill|polymorphism|pool|port|preprocessor|primitive|priority|private|procedure|process|processor|production|profiler|promise|property|protocol|prototype|proxy|query|queue|recursion|redirect|reducer|reference|reflection|regex|registry|relational|rendering|repository|request|response|rest|router|runtime|sandbox|scope|script|security|selector|semantics|serialization|server|service|session|shadow|shell|signal|singleton|sitemap|socket|sorting|source|specification|sql|stack|standard|stateless|static|stream|string|structure|style|subclass|submitting|subscriber|superclass|svg|syntax|system|tag|task|template|terminal|testing|thread|token|transaction|transform|transition|transpiler|tree|trigger|tuple|type|typescript|ui|unit|uri|url|user|utility|validation|value|vanilla|variable|vector|version|viewport|virtual|visibility|visualisation|web|webpack|websocket|worker|workflow|wrapper|xml|yaml)\b/gi) || [])
      .map(word => word.toLowerCase());
    
    // Extract verbs (actions)
    const verbs = (text.match(/\b(learn|create|build|develop|understand|implement|code|design|struggle|help|fix|debug|analyze|solve|test|deploy|optimize|refactor|review|explore|discuss|explain|simplify|integrate|research|investigate|generate|identify|modify|update|configure|install|setup|initialize|verify|validate|document|define|maintain|support|troubleshoot|monitor|manage|automate|organize|plan|execute|evaluate|assess|compare|contrast|adapt|enhance|improve|upgrade|expand|extend|customize|adjust|transform|convert|migrate|transfer|process|handle|control|manipulate|retrieve|store|backup|restore|cache|load|save|edit|insert|delete|remove|add|subtract|multiply|divide|calculate|compute|compile|decompile|encrypt|decrypt|secure|protect|authenticate|authorize|register|login|logout|submit|cancel|approve|reject|accept|deny|prevent|allow|enable|disable|toggle|switch|start|stop|pause|resume|reboot|refresh|reload|reset|clear|clean|scan|search|find|locate|filter|sort|merge|split|combine|separate|isolate|connect|disconnect|link|unlink|bind|unbind|attach|detach|mount|unmount|interact|communicate|send|receive|publish|subscribe|broadcast|stream|record|play|parse|format|wrap|unwrap|pack|unpack|compress|decompress|archive|extract|import|export|read|write|open|close|print|display|render|animate|apply|visualize|prepare|access|respond|reply|confirm|track|measure|rate|classify|categorize|index|outline|draft|finalize|iterate|repeat|schedule|queue|prioritize|override|synchronize|asynchronize|cascade|delegate|invoke|reference|inherit|override|instantiate|declare|allocate|deallocate|intercept|serialize|deserialize|normalize|denormalize|parallelize|encapsulate|abstract|inject|reverse|traverse|preprocess|postprocess|scaffold|provision|replicate|distribute|cluster|scale|fetch|retry|throttle|debounce|memoize|persist|materialize|compose|decompose|specialize|generalize|virtualize|materialize|annotate|escape|unescape|sanitize|normalize|tokenize|stream|buffer|format|conform|transform|interpret|evaluate|serialize|deserialize|sign|verify|revoke|grant|normalize|obfuscate|minify|transpile|interpret|emulate|simulate|redirect|route|resolve|reject|fulfill|throw|catch|handle|preload|query|subscribe|unsubscribe|emit|consume|redirect|forward|reuse|substitute|derive|construct|destruct|register|unregister|dispatch|reduce|map|filter|apply|bind|call)\b/gi) || [])
      .map(word => word.toLowerCase());
    
    // Identify positive words
    const positiveWords = (text.match(/\b(great|good|love|like|helpful|useful|thank|appreciate|easy|clear|excellent|amazing|awesome|fantastic|wonderful|superb|brilliant|outstanding|perfect|impressive|remarkable|exceptional|delightful|terrific|pleasant|positive|valuable|effective|efficient|beneficial|convenient|productive|successful|insightful|intuitive|innovative|inspiring|encouraging|supportive|engaging|exciting|fascinating|interesting|joyful|happy|glad|pleased|satisfied|enjoyable|straightforward|elegant|clever|smart|quick|favorable|smooth|seamless|flawless|reliable|trustworthy|recommended|congratulations|well-done|bravo|accomplished|accurate|achievable|achievement|adaptable|adept|adequate|admirable|adorable|adored|adroit|adventurous|affable|affectionate|affordable|agile|agreeable|alert|aligned|alluring|ambitious|amiable|amicable|ample|appealing|appreciative|appropriate|apt|ardent|artistic|assertive|assured|astonishing|astounding|astute|attentive|attractive|authentic|balanced|beautiful|believable|beloved|beneficial|benevolent|best|better|blessed|blissful|bold|brave|breathtaking|bright|brilliant|buoyant|calm|capable|captivating|caring|celebrated|centered|certain|charming|cheerful|cherished|choice|civilized|classic|classy|clean|clever|coherent|comfortable|commendable|committed|communicative|compact|compassionate|compelling|competent|competitive|complete|comprehensive|concise|confident|considerate|consistent|constructive|content|convenient|convincing|cooperative|coordinated|cordial|correct|courageous|courteous|creative|credible|crisp|crucial|cultivated|cultured|curious|daring|dazzling|decent|decisive|dedicated|deep|defiant|delicious|desirable|detailed|determined|devoted|diligent|diplomatic|disciplined|discreet|distinctive|distinguished|diverse|divine|driven|durable|dynamic|eager|earnest|easygoing|economical|educated|effective|efficient|effortless|elaborate|elegant|eloquent|empathetic|empowering|enchanting|encouraging|endearing|energetic|engaging|enhanced|enjoyable|enlightened|enriching|enthusiastic|enticing|essential|esteemed|ethical|exalted|excellent|exceptional|excited|exciting|exemplary|experienced|exquisite|extraordinary|exuberant|fabulous|fair|faithful|familiar|famous|fancy|fantastic|fascinating|fashionable|fast|favorable|fearless|fine|fitting|flexible|flourishing|flowing|fluent|focused|fond|forgiving|formidable|fortuitous|fortunate|fragrant|free|fresh|friendly|fruitful|fulfilled|fun|funny|futuristic|gallant|generous|genial|genius|gentle|genuine|gifted|glamorous|gleaming|gleeful|glorious|glowing|good-natured|gorgeous|graceful|gracious|grand|grateful|gratified|great|gregarious|grounded|growing|handsome|handy|happy|hardworking|harmonious|healthy|heartwarming|heavenly|helpful|heroic|high-quality|honest|honorable|hopeful|hospitable|humble|humorous|ideal|illuminating|illustrious|imaginative|immaculate|immediate|immense|immune|impartial|impeccable|important|improved|improving|inclusive|incredible|independent|indispensable|individualistic|industrious|infinite|influential|informative|ingenious|innovative|insightful|inspirational|inspired|integral|integrated|intelligent|intense|interested|interesting|intimate|intrepid|intuitive|invaluable|inventive|invigorating|inviting|irresistible|irreplaceable|jovial|joyful|joyous|jubilant|judicious|keen|kind|kindhearted|knowledgeable|laudable|lavish|leader|learned|legendary|legitimate|liberated|light|likable|lively|logical|lovable|lovely|loving|loyal|lucid|lucky|luminous|luxurious|magical|magnificent|majestic|manageable|masterful|mature|meaningful|measurable|memorable|merciful|merry|methodical|meticulous|mighty|mindful|miraculous|mirthful|modest|momentous|motivating|moving|natural|neat|necessary|nice|noble|nourishing|nurturing|obedient|obliging|observant|optimistic|orderly|organized|original|outgoing|outstanding|passionate|patient|peaceful|perceptive|perfect|persevering|persistent|personable|persuasive|philanthropic|pleasant|pleased|pleasing|plentiful|poetic|poised|polished|polite|popular|positive|powerful|practical|precious|precise|premium|prepared|present|prestigious|pretty|priceless|principled|proactive|professional|profound|profuse|progressive|prolific|prominent|promising|prompt|proper|prosperous|protective|proud|punctual|pure|purposeful|quaint|qualified|quality|quick-witted|quiet|quintessential|radiant|rapid|rational|reachable|ready|realistic|reasonable|reassuring|receptive|refined|refreshing|regal|reliable|remarkable|resolute|resourceful|respected|respectful|resplendent|responsive|restful|restored|revolutionary|rewarding|rich|robust|romantic|rousing|sacred|safe|satisfying|scholarly|scientific|secure|selective|self-assured|sensational|sensible|sensitive|serene|settled|sharing|sharp|shimmering|shining|shrewd|simple|sincere|skilled|skillful|sleek|smart|smiling|smooth|sociable|soft|solemn|solid|sophisticated|soulful|sparkling|special|spectacular|speedy|spirited|splendid|spontaneous|sporting|stable|steadfast|steady|stellar|stimulating|straightforward|streamlined|strong|stunning|stupendous|stylish|sublime|substantial|successful|succinct|suitable|sunny|super|superb|superior|supportive|supreme|sure|surprising|surviving|sweet|swift|sympathetic|systematic|talented|tangible|tasteful|tempting|tenacious|tender|terrific|thankful|thorough|thoughtful|thrilled|thrilling|thriving|tidy|timeless|timely|tolerant|top|touching|tough|tranquil|transcendent|transparent|treasured|tremendous|triumphant|trusted|trustworthy|truthful|ultimate|unassuming|unbeatable|unbiased|uncommon|understanding|unequaled|unexpected|unforgettable|unified|unique|united|unlimited|unmatched|unparalleled|unpretentious|unusual|unwavering|upbeat|upright|upstanding|urbane|usable|useful|valuable|venerable|venturesome|versatile|vibrant|victorious|vigilant|vigorous|virtuous|visionary|vital|vivacious|warm|warmhearted|wealthy|welcome|well-behaved|well-informed|well-rounded|whole|wholesome|willing|wise|witty|wonderful|wondrous|worthy|zealous|zestful)\b/gi) || [])
      .map(word => word.toLowerCase());
    
    // Identify negative words
    const negativeWords = (text.match(/\b(bad|confuse|difficult|hard|struggle|problem|issue|hate|dislike|awful|terrible|horrible|poor|disappointing|frustrating|annoying|irritating|useless|worthless|ineffective|inefficient|complicated|complex|confusing|unclear|vague|ambiguous|misleading|challenging|troublesome|problematic|faulty|defective|broken|unreliable|unstable|slow|laggy|buggy|glitchy|error|failure|crash|malfunction|mistake|wrong|incorrect|inaccurate|inadequate|insufficient|limited|restricted|inconvenient|cumbersome|tedious|boring|dull|uninteresting|unpleasant|uncomfortable|dissatisfied|unhappy|upset|angry|irritated|worried|concerned|troubled|stressful|overwhelming|exhausting|tiresome|pointless|abnormal|abrasive|absurd|abusive|adverse|aggressive|agitated|agonizing|alarming|alienated|appalling|arrogant|artificial|ashamed|atrocious|awkward|banal|barbaric|battered|bewildered|bizarre|bleak|bloated|blunt|blurred|bothersome|burdensome|careless|chaotic|cheated|clumsy|coarse|cold|collapsed|combative|condemned|conflict|confrontational|confounded|confused|congested|constricted|contradictory|contrary|controversial|corrupt|costly|counterproductive|cracked|crazy|creepy|criminal|crippled|critical|crude|cruel|crushed|cynical|damaged|damaging|dangerous|dark|deadly|decaying|deceptive|deficient|degraded|delayed|delirious|demanding|demeaning|depressed|deprived|deserted|despicable|destroyed|detrimental|devastating|devious|difficult|diminished|dirty|disabled|disastrous|discarded|disconnected|discouraged|disgraceful|disgusted|dishonest|dishonorable|disillusioned|dismal|dismayed|disordered|disorganized|disoriented|disparaging|displaced|displeased|disproportionate|disputed|distorted|distracted|distressed|disturbed|dominated|doubtful|dreadful|dreary|dropped|dumb|dumped|dysfunctional|eerie|embarrassed|embittered|erroneous|evil|excessive|excluded|exhausted|exploited|exposed|failed|fake|false|fearful|flawed|flimsy|foolish|forced|fragile|frail|frantic|fraud|frivolous|fussy|garish|greedy|grievous|grim|gross|grotesque|guilty|handicapped|hapless|harassed|harmful|harsh|hasty|hated|hazardous|helpless|hindered|hollow|hopeless|hostile|humiliating|hurt|ignorant|ignored|illegal|illegitimate|illiterate|illogical|immature|immoral|impaired|impatient|imperfect|impossible|impoverished|imprecise|impulsive|inadequate|inappropriate|inattentive|incompatible|incompetent|incomplete|inconsiderate|inconsistent|incorrect|indecent|indecisive|indifferent|ineffective|inequitable|inferior|inflexible|insane|insecure|insensitive|insignificant|insulting|intolerable|intrusive|invalid|invasive|irresponsible|isolated|jealous|judged|jumbled|jumpy|lackadaisical|lame|lax|lazy|leaky|lengthy|lethal|limp|lost|lousy|lumpy|mad|malicious|mangled|manipulated|marred|meaningless|mediocre|menacing|messy|miserable|misguided|misleading|mismanaged|misplaced|missed|mistaken|mixed|mocked|monotonous|morbid|morose|mundane|murky|mutilated|nasty|nauseating|naughty|negative|neglected|neglectful|negligent|nervous|non-functional|notoriously|novelty|noxious|objectionable|obscene|obsolete|obstructive|odd|offensive|ominous|oppressive|outrageous|overgrown|overlooked|overwhelming|painful|panicky|paranoid|pathetic|peculiar|perplexed|perverse|pessimistic|petrified|pitiful|powerless|precarious|prejudiced|pretentious|primitive|pungent|puzzling|questionable|quitter|radical|ragged|rebellious|reckless|redundant|regretful|rejected|reluctant|repetitive|repressed|repugnant|repulsive|resisted|restrictive|retarded|revengeful|ridiculous|rigid|risky|rough|rude|ruthless|sabotaged|sad|scared|scattered|scratched|second-rate|self-doubting|selfish|senseless|shaky|shattered|shoddy|shortcoming|sickening|sidelined|silly|sinful|skeptical|sloppy|sluggish|smashed|smothered|spiteful|spoiled|stagnant|stark|stolen|stormy|strange|stressful|stuck|subdued|submissive|substandard|superficial|suspicious|tangled|tarnished|tense|terrible|thoughtless|threatening|thwarted|tormented|tortured|toxic|tragic|treacherous|traumatic|troubled|turbulent|ugly|unacceptable|unattractive|uncaring|uncertain|unclear|uncomfortable|unconvinced|underrated|uneasy|unethical|unfair|unfavorable|unfocused|unfriendly|unhealthy|unimportant|uninspired|unjust|unlawful|unnecessary|unpleasant|unproductive|unprofessional|unreasonable|unreliable|unsuccessful|unsuitable|untidy|unwanted|unwelcome|unworthy|upset|uptight|useless|vague|vain|vicious|violent|warped|wasteful|weary|weird|wicked|withdrawn|worried|worrisome|worthless|wounded|wrong)\b/gi) || [])
      .map(word => word.toLowerCase());
    
    // Calculate sentiment score (mock)
    let sentiment = 0;
    sentiment += positiveWords.length * 0.8;
    sentiment -= negativeWords.length * 0.8;
    
    // If no positive or negative words, add slight randomness
    if (positiveWords.length === 0 && negativeWords.length === 0) {
      sentiment = (Math.random() * 2 - 1) * 0.3; // Random value between -0.3 and 0.3
    }
    
    const comparative = sentiment / (text.split(' ').length || 1);
    
    return {
      id: msg._id.toString(),
      text: text,
      isBot: msg.isBot, // Include isBot flag in processed data
      sentiment: sentiment,
      comparative: comparative,
      nouns,
      verbs,
      positiveWords,
      negativeWords
    };
  });
}

// Generate time series data from chat sessions
function generateTimeSeriesData(lectures, chatSessions) {
  const dateMap = new Map();
  
  // Group by date and calculate average sentiment
  lectures.forEach(lecture => {
    const lectureDate = new Date(lecture.startDate).toISOString().split('T')[0];
    const lectureSessions = chatSessions.filter(session => 
      session.lectureId.toString() === lecture._id.toString()
    );
    
    if (lectureSessions.length > 0) {
      let totalSentiment = 0;
      let messageCount = 0;
      
      lectureSessions.forEach(session => {
        if (session.messages && session.messages.length > 0) {
          // Only consider user messages
          const userMessages = session.messages.filter(msg => !msg.isBot);
          if (userMessages.length === 0) return; // Skip if no user messages
          
          const { score } = analyzeSentiment(userMessages);
          totalSentiment += score * userMessages.length;
          messageCount += userMessages.length;
        }
      });
      
      const averageSentiment = messageCount > 0 ? totalSentiment / messageCount : 0;
      
      dateMap.set(lectureDate, {
        date: lectureDate,
        sentiment: averageSentiment,
        topic: lecture.title
      });
    }
  });
  
  return Array.from(dateMap.values())
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

export default async function handler(req, res) {
  const { method } = req;
  const { classId } = req.query;
  
  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        // First, find all lectures belonging to this class
        const lectures = await Lecture.find({ classId }).sort({ startDate: 1 });
        
        if (!lectures || lectures.length === 0) {
          return res.status(200).json({ 
            success: true, 
            data: [],
            timeSeriesData: [],
            count: 0
          });
        }
        
        const lectureIds = lectures.map(lecture => lecture._id);
        
        // Then find all chat sessions linked to these lectures
        const chatSessions = await ChatSession.find({
          lectureId: { $in: lectureIds }
        }).sort({ updatedAt: -1 });
        
        // Transform the data for the front-end
        const lectureData = lectures.map(lecture => {
          // Find chat sessions for this lecture
          const lectureSessions = chatSessions.filter(
            session => session.lectureId.toString() === lecture._id.toString()
          );
          
          // Combine all messages from the lecture's chat sessions
          const allMessages = lectureSessions.flatMap(session => session.messages || []);
          
          // Filter to only include user messages for sentiment analysis
          const userMessages = allMessages.filter(msg => !msg.isBot);
          
          // Analyze sentiment using only user messages
          const { score, comparative } = analyzeSentiment(userMessages);
          
          // Extract key topics and verbs using only user messages
          const { topics: keyTopics, verbs: keyVerbs } = extractKeywords(userMessages);
          
          // Process all messages for detailed view (we include bot messages in display but mark them)
          const processedMessages = processMessages(allMessages);
          
          return {
            id: lecture._id.toString(),
            title: lecture.title,
            date: new Date(lecture.startDate).toISOString().split('T')[0],
            sentimentScore: score,
            comparative: comparative,
            keyTopics,
            keyVerbs,
            messages: processedMessages,
            userMessageCount: userMessages.length,
            totalMessageCount: allMessages.length
          };
        });
        
        // Generate time series data
        const timeSeriesData = generateTimeSeriesData(lectures, chatSessions);
        
        return res.status(200).json({ 
          success: true, 
          data: lectureData,
          timeSeriesData,
          count: lectureData.length
        });
      } catch (error) {
        console.error('Error fetching chat sessions for class:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to fetch chat sessions for this class' 
        });
      }
      break;
    
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}