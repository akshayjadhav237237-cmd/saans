import type { TranslationKey } from './en';

export const hiAdvisory: Partial<Record<TranslationKey, string>> = {
  // Community Advisory Panel
  'community.title': 'सामुदायिक एवं संस्थागत सलाह',
  'community.subtitle': 'आरडब्ल्यूए (RWA), स्कूलों और संस्थानों के लिए आवश्यक दिशानिर्देश',
  'community.school.status': 'स्कूल खेलकूद और बाहरी प्रार्थना सभा:',
  'community.school.permitted': 'अनुमति है (वायु गुणवत्ता सीमा के भीतर है)',
  'community.school.suspended': 'रोक / स्थगित (छात्रों को बाहरी भारी शारीरिक श्रम से बचाएं)',
  'community.actions.title': 'सामुदायिक स्तर पर अनुशंसित कदम',

  // Actions Catalog Titles & Reasons
  'action.shift_outdoor_play.title': 'बच्चों का खेलकूद दोपहर के समय रखें',
  'action.shift_outdoor_play.desc': 'शाम 5 बजे के भारी धुंध वाले समय बच्चों को बाहर न खेलने दें।',
  'action.indoor_exercise.title': 'सुबह की सैर की जगह घर के अंदर व्यायाम करें',
  'action.indoor_exercise.desc':
    'सर्दियों में सुबह के समय जमीन के पास सबसे जहरीला धुआं जमा रहता है।',
  'action.commute_n95_mask.title': 'यात्रा के दौरान N95 मास्क पहनें',
  'action.commute_n95_mask.desc': 'चेहरे पर ठीक से बैठा N95 मास्क 90% तक जहरीले कणों को रोकता है।',
  'action.school_run_timing.title': 'सुबह स्कूल जाते समय बच्चों की सुरक्षा',
  'action.school_run_timing.desc': 'सुबह की भारी धुंध में बंद वाहन और मास्क का प्रयोग करें।',
  'action.seal_door_gaps.title': 'खिड़कियों और दरवाजों की दरारें सील करें',
  'action.seal_door_gaps.desc': 'फोम टेप लगाने से बाहर का धुआं 15-20% तक कम अंदर आता है।',
  'action.purifier_bedroom.title': 'सोने के कमरे में HEPA प्यूरीफायर चलाएं',
  'action.purifier_bedroom.desc':
    'रात को बंद कमरे में प्यूरीफायर फेफड़ों में जाने वाले धुएं को आधा कर देता है।',
  'action.damp_mop_not_dry_sweep.title': 'सूखी झाड़ू की जगह गीला पोछा लगाएं',
  'action.damp_mop_not_dry_sweep.desc':
    'सूखी झाड़ू से धूल फिर हवा में उड़ती है; गीला पोछा कणों को समेट लेता है।',
  'action.cook_with_ventilation.title': 'खाना बनाते समय चिमनी या एग्जॉस्ट फैन चलाएं',
  'action.cook_with_ventilation.desc':
    'बिना निकास के खाना पकाने से घर के अंदर खतरनाक धुआं जमा होता है।',
  'action.no_incense_or_coils.title': 'अगरबत्ती और मच्छर कॉइल का प्रयोग बंद करें',
  'action.no_incense_or_coils.desc':
    'अगरबत्ती का धुआं कमरे में जहरीले बारीक कणों की मात्रा बहुत बढ़ा देता है।',
  'action.diy_corsi_rosenthal_box.title': 'कम लागत वाला कॉरसी-रोजेनथल एयर फिल्टर बनाएं',
  'action.diy_corsi_rosenthal_box.desc':
    'MERV-13 फिल्टर और पंखे से बना यह बॉक्स पूरे कमरे की हवा साफ करता है।',
  'action.metro_bus_commute.title': 'दोपहिया की जगह मेट्रो या बस का प्रयोग करें',
  'action.metro_bus_commute.desc': 'बंद सार्वजनिक परिवहन में सीधे धुएं का प्रभाव बहुत कम होता है।',
  'action.carpool_shared_cab.title': 'कारपूल करें या साझा सवारी लें',
  'action.carpool_shared_cab.desc': 'सड़क पर वाहनों की संख्या और उनसे निकलने वाला प्रदूषण घटता है।',
  'action.carpool_shared_cab.reason': 'इलाके में वाहनों के धुएं में कमी।',
  'action.clean_cooking_fuel.title': 'रसोई में एलपीजी या इंडक्शन का प्रयोग करें',
  'action.clean_cooking_fuel.desc': 'लकड़ी या कोयले का धुआं घर और आसपास गंभीर प्रदूषण फैलाता है।',
  'action.clean_cooking_fuel.reason': 'ठोस ईंधन के हानिकारक धुएं से पूर्ण मुक्ति।',
  'action.zero_waste_burning.title': 'कचरा और सूखे पत्ते जलाना बंद करें',
  'action.zero_waste_burning.desc': 'सूखे पत्तों की खाद बनाएं, उन्हें सड़क किनारे बिल्कुल न जलाएं।',
  'action.zero_waste_burning.reason': 'गलियों में जहरीले धुएं के गुबार से बचाव।',
  'action.skip_firecrackers.title': 'पटाखों के बिना स्वच्छ उत्सव मनाएं',
  'action.skip_firecrackers.desc':
    'पटाखों के धुएं में जहरीली धातुएं होती हैं जो हवा को बेहद खराब कर देती हैं।',
  'action.skip_firecrackers.reason': 'त्योहारों पर अचानक बढ़ने वाले प्रदूषण से बचाव।',
  'action.vehicle_engine_idle_off.title': 'लाल बत्ती पर गाड़ी का इंजन बंद करें',
  'action.vehicle_engine_idle_off.desc':
    'खड़े रहकर इंजन चलाने से सड़क पर जहरीली गैसें जमा होती हैं।',
  'action.vehicle_engine_idle_off.reason': 'सड़क पर रुकने के दौरान होने वाले प्रदूषण में कमी।',
  'action.rwa_dust_control.title': 'सोसायटी में पानी का छिड़काव करवाएं',
  'action.rwa_dust_control.desc':
    'कच्ची सड़कों पर पानी छिड़कने से उड़ने वाली धूल जमीन पर बैठ जाती है।',
  'action.rwa_dust_control.reason': 'धूल प्रदूषण को रोकने में सामुदायिक सहयोग।',
  'action.school_outdoor_threshold.title': 'स्कूलों में स्वच्छ हवा नीति का समर्थन करें',
  'action.school_outdoor_threshold.desc':
    'AQI 200 से अधिक होने पर बाहरी खेलकूद बंद रखने का आग्रह करें।',
  'action.school_outdoor_threshold.reason': 'गंभीर धुंध में बच्चों के फेफड़ों की सुरक्षा।',
  'action.shared_rwa_purifier_room.title': 'आरडब्ल्यूए साझा स्वच्छ हवा कक्ष बनाएं',
  'action.shared_rwa_purifier_room.desc':
    'बुजुर्गों और घरेलू सहायकों के लिए एक प्यूरीफायर युक्त साझा कमरा उपलब्ध कराएं।',
  'action.shared_rwa_purifier_room.reason': 'संवेदनशील नागरिकों के लिए सुरक्षित आश्रय।',

  // Advisory Headline & Advice Keys
  'advisory.good.headline': 'वायु गुणवत्ता संतोषजनक है',
  'advisory.good.advice': 'प्रदूषण का कोई खतरा नहीं है। बाहरी गतिविधियों के लिए अनुकूल मौसम है।',
  'advisory.moderate.headline': 'मध्यम वायु गुणवत्ता',
  'advisory.moderate.advice':
    'हवा स्वीकार्य है। सांस के अत्यधिक संवेदनशील लोग अधिक समय बाहर मेहनत करने से बचें।',
  'advisory.sensitive.headline': 'संवेदनशील समूहों के लिए अस्वस्थ हवा',
  'advisory.sensitive.advice':
    'बच्चों, बुजुर्गों और दमा के मरीजों को बाहर अधिक देर व्यायाम करने से बचना चाहिए।',
  'advisory.unhealthy.headline': 'अस्वस्थ वायु गुणवत्ता का दौर',
  'advisory.unhealthy.advice':
    'सभी लोगों के स्वास्थ्य पर असर पड़ सकता है। बाहर कम निकलें और N95 मास्क पहनें।',
  'advisory.very_unhealthy.headline': 'गंभीर धुंध आपातकाल',
  'advisory.very_unhealthy.advice':
    'स्वास्थ्य चेतावनी: सभी के लिए गंभीर खतरा है। घर को बंद रखें और प्यूरीफायर चलाएं।',
  'advisory.hazardous.headline': 'अत्यधिक खतरनाक प्रदूषण आपातकाल',
  'advisory.hazardous.advice':
    'आपातकालीन स्वास्थ्य चेतावनी। पूरी आबादी पर गंभीर असर। बाहर जाने से पूरी तरह बचें।',

  // Advisory Actions
  'advisory.action.routine_maintenance':
    'सड़क सफाई और सार्वजनिक परिवहन का सुचारू संचालन जारी रखें।',
  'advisory.action.promote_cycling': 'साइकिल और पैदल आवागमन को बढ़ावा दें।',
  'advisory.action.dust_suppression': 'कच्ची सड़कों और निर्माण स्थलों पर हल्का पानी छिड़कें।',
  'advisory.action.anti_idling_monitoring':
    'स्कूलों और दफ्तरों के बाहर वाहनों को चालू रखकर खड़े रहने से रोकें।',
  'advisory.action.wet_sweeping':
    'धूल को हवा में उड़ने से रोकने के लिए केवल गीली सफाई का उपयोग करें।',
  'advisory.action.indoor_recess': 'स्कूलों में खेलकूद और प्रार्थना सभा घर या हॉल के अंदर करवाएं।',
  'advisory.action.stagger_office_hours':
    'सड़कों पर भीड़ घटाने के लिए दफ्तरों और स्कूलों के समय में अंतर रखें।',
  'advisory.action.halt_construction_dust': 'खुदाई और तोड़फोड़ के सभी धूल भरे काम तत्काल रोकें।',
  'advisory.action.community_clean_air_shelter':
    'नागरिकों के लिए वातानुकूलित और प्यूरीफायर युक्त स्वच्छ हवा केंद्र खोलें।',
  'advisory.action.mandatory_work_from_home':
    'सरकारी और निजी संस्थानों में 50% घर से काम (WFH) लागू करें।',
  'advisory.action.emergency_smog_guns':
    'प्रमुख चौराहों और अधिक प्रदूषण वाले क्षेत्रों में एंटी-स्मॉग गन तैनात करें।',
  'advisory.action.emergency_curfew':
    'गैर-जरूरी भारी डीजल ट्रकों के शहर में प्रवेश पर पूर्ण प्रतिबंध लगाएं।',
  'advisory.action.complete_construction_ban':
    'निर्माण और विध्वंस गतिविधियों पर पूर्ण रोक लागू करें।',
  'advisory.action.open_air_filtration_halls':
    'घनी आबादी वाले इलाकों में सार्वजनिक सुरक्षित आश्रय स्थल बनाएं।',

  // Disclosures
  'ai.disclosure.aqi_band': 'वर्तमान वायु गुणवत्ता श्रेणी (जैसे: अस्वस्थ)',
  'ai.disclosure.rounded_pm25': 'PM2.5 का पूर्णांक मान',
  'ai.disclosure.member_kinds': 'परिवार के सदस्यों की श्रेणी (बच्चा/वयस्क/बुजुर्ग)',
  'ai.disclosure.action_deltas': 'सुझाए गए कदमों के नाम और उनसे होने वाली अनुमानित कमी',
  'ai.disclosure.language': 'चुनी गई भाषा (अंग्रेजी या हिंदी)',

  // Validation & Error Keys
  'profile.error.name_required': 'परिवार का नाम दर्ज करना आवश्यक है।',
  'profile.error.city_required': 'शहर का चयन आवश्यक है।',
  'profile.error.members_required': 'कम से कम एक सदस्य जोड़ना आवश्यक है।',
  'profile.error.max_members_exceeded': 'अधिकतम 6 सदस्यों की अनुमति है।',
  'profile.error.member_id_required': 'मान्य सदस्य पहचान आवश्यक है।',
  'question.error.too_short': 'कृपया कम से कम 3 अक्षरों का प्रश्न लिखें।',
  'question.error.too_long': 'प्रश्न 280 अक्षरों की अधिकतम सीमा से अधिक है।',
  'question.error.injection_detected':
    'असमर्थित प्रारूप। कृपया सीधे वायु प्रदूषण के बारे में पूछें।',

  // Best window labels
  'window.exercise.optimal': 'व्यायाम के लिए सबसे अनुकूल समय',
  'window.school_run.optimal': 'सफर में सबसे कम प्रदूषण का समय',
  'window.ventilation.optimal': 'घर में ताजी हवा लेने का समय',
};
