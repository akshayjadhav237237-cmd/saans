import { ok, type Result } from '../domain/result';
import type {
  AiAnswer,
  AiExplanation,
  AiProvider,
  AnswerQuestionInput,
  ExplainPlanInput,
} from './port';

interface TopicMatch {
  readonly keywords: readonly string[];
  readonly answerEn: string;
  readonly answerHi: string;
  readonly suggestedActionId?: string | undefined;
}

const TOPIC_MATCHES: readonly TopicMatch[] = [
  {
    keywords: ['mask', 'n95', 'cloth', 'surgical'],
    answerEn:
      'N95 respirators provide high particulate filtration when fitted tightly against your face without air gaps.',
    answerHi:
      'N95 मास्क हवा के महीन कणों को सबसे प्रभावी ढंग से रोकता है जब यह चेहरे पर बिना ढीलेपन के ठीक से बैठे।',
    suggestedActionId: 'commute_n95_mask',
  },
  {
    keywords: ['purifier', 'hepa', 'cleaner', 'filter'],
    answerEn:
      'True HEPA purifiers cut indoor PM2.5 in closed rooms when operated continuously during severe smog.',
    answerHi:
      'गंभीर धुंध के दौरान कमरे को बंद रखकर लगातार HEPA प्यूरीफायर चलाने से इनडोर प्रदूषण काफी घटता है।',
    suggestedActionId: 'purifier_bedroom',
  },
  {
    keywords: ['cook', 'kitchen', 'exhaust', 'gas'],
    answerEn:
      'Always run kitchen exhaust fans or chimneys to prevent indoor particulate buildup from frying and oil smoke.',
    answerHi:
      'खाना पकाते समय एग्जॉस्ट फैन या चिमनी चालू रखें ताकि धुएं और तेल के बारीक कण घर में न फैलें।',
    suggestedActionId: 'cook_with_ventilation',
  },
  {
    keywords: ['exercise', 'walk', 'run', 'workout'],
    answerEn:
      'Avoid outdoor morning jogging during severe winter inversions; shift workouts indoors or to early afternoon.',
    answerHi:
      'सुबह के समय बाहर व्यायाम न करें। कसरत घर के अंदर करें या दोपहर में जब हवा थोड़ी साफ हो।',
    suggestedActionId: 'indoor_exercise',
  },
  {
    keywords: ['commute', 'metro', 'bus', 'bike', 'travel'],
    answerEn:
      'Public metro transit provides substantially lower exhaust exposure than traveling on open two-wheelers.',
    answerHi:
      'खुले दोपहिया वाहन की तुलना में मेट्रो या बंद बस से यात्रा करने पर जहरीले धुएं से बचाव होता है।',
    suggestedActionId: 'metro_bus_commute',
  },
  {
    keywords: ['child', 'kid', 'school'],
    answerEn:
      'Children have higher respiratory rates; keep school outdoor recess indoors during unhealthy smog days.',
    answerHi:
      'बच्चों की सांस की गति तेज होती है। अत्यधिक प्रदूषण वाले दिनों में खेलकूद केवल इनडोर होना चाहिए।',
    suggestedActionId: 'school_run_timing',
  },
  {
    keywords: ['elder', 'senior', 'parent', 'asthma'],
    answerEn:
      'Elderly family members and those with respiratory issues should stay in a sealed, purified room.',
    answerHi:
      'बुजुर्गों और सांस के मरीजों को बंद और प्यूरीफायर वाले साफ कमरे में ही आराम करना चाहिए।',
    suggestedActionId: 'purifier_bedroom',
  },
  {
    keywords: ['burn', 'waste', 'incense', 'coil', 'agarbatti'],
    answerEn:
      'Never burn dry leaves or solid waste, and avoid incense sticks which create heavy indoor particulate spikes.',
    answerHi:
      'कचरा या पत्तियां कभी न जलाएं और घर के अंदर अगरबत्ती या मच्छर कॉइल के धुएं से पूरी तरह बचें।',
    suggestedActionId: 'no_incense_or_coils',
  },
  {
    keywords: ['seal', 'gap', 'window', 'door'],
    answerEn:
      'Sealing door undersides and window perimeters with foam tape blocks outdoor smog from entering.',
    answerHi:
      'दरवाजों और खिड़कियों के किनारों को फोम टेप से सील करने पर जहरीली हवा अंदर नहीं आ पाती।',
    suggestedActionId: 'seal_door_gaps',
  },
  {
    keywords: ['humidifier', 'mist', 'water'],
    answerEn:
      'Humidifiers do not filter particulate matter, and mineral tap water mist can increase particle counts.',
    answerHi:
      'ह्यूमिडिफायर हवा के कणों को साफ नहीं करता, और नल के पानी की भाप से हवा में कण बढ़ सकते हैं।',
  },
  {
    keywords: ['sleep', 'night', 'bedroom'],
    answerEn:
      'Keep bedroom doors and windows shut and run a HEPA purifier through the night to protect resting lungs.',
    answerHi:
      'रात को सोते समय बेडरूम की खिड़कियां बंद रखें और फेफड़ों की सुरक्षा के लिए प्यूरीफायर चलाएं।',
    suggestedActionId: 'purifier_bedroom',
  },
  {
    keywords: ['ventilate', 'open window', 'fresh air'],
    answerEn:
      'Open windows only for short intervals around midday when solar heat lifts ground-level smog inversions.',
    answerHi:
      'खिड़कियां केवल दोपहर 12 से 3 बजे के बीच थोड़ी देर खोलें जब धूप से जमी हुई धुंध थोड़ी छंटती है।',
  },
];

/**
 * Deterministic on-device AI provider generating template-based guidance and intent-matched answers.
 */
export const LocalProvider: AiProvider = {
  id: 'local',

  async explainPlan(input: ExplainPlanInput): Promise<Result<AiExplanation, string>> {
    const isHi = input.payload.language === 'hi';
    const topAction = input.payload.actions[0];
    const topSavings = topAction ? topAction.deltaPercent : 0;

    const summary = isHi
      ? `आपकी योजना प्रदूषण जोखिम को कम करती है। प्रमुख कदमों से सांस में जाने वाला धुआं लगभग ${topSavings}% तक घट सकता है।`
      : `Your personalized plan targets your highest daily exposure hours, reducing inhaled particulate dose by up to ${topSavings}%.`;

    const highlights = isHi
      ? [
          'कमरे की खिड़कियों और दरवाजों के अंतर को सील रखें।',
          'सड़क पर यात्रा करते समय प्रमाणित N95 मास्क का उपयोग करें।',
          'दोपहर के सबसे अनुकूल समय में ही जरूरी बाहरी कार्य करें।',
        ]
      : [
          'Keep living spaces sealed and operate air filtration in resting areas.',
          'Wear a well-fitted particulate respirator during roadside travel.',
          'Schedule unavoidable outdoor tasks during the lowest diurnal smog window.',
        ];

    return ok({ summary, highlights });
  },

  async answerQuestion(input: AnswerQuestionInput): Promise<Result<AiAnswer, string>> {
    const qLower = input.question.toLowerCase();
    const isHi = input.payload.language === 'hi';

    for (const match of TOPIC_MATCHES) {
      if (match.keywords.some((kw) => qLower.includes(kw))) {
        return ok({
          text: isHi ? match.answerHi : match.answerEn,
          suggestedActionId: match.suggestedActionId,
        });
      }
    }

    const defaultText = isHi
      ? 'सर्दियों के गंभीर प्रदूषण में बंद इनडोर वातावरण और N95 मास्क ही सबसे सुरक्षित विकल्प हैं।'
      : 'During severe winter smog episodes, maintaining sealed indoor air and using certified N95 respirators are your most reliable defenses.';

    return ok({ text: defaultText });
  },
};
