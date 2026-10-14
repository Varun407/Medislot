// --------------------------------------------------------------------------
// Phonetic Transliteration Utility for Dynamic Proper Names (Telugu ↔ English)
// --------------------------------------------------------------------------

const INITIAL_MAP: Record<string, string> = {
  'A.': 'ఎ.', 'B.': 'బి.', 'C.': 'సి.', 'D.': 'డి.', 'E.': 'ఇ.', 'F.': 'ఎఫ్.',
  'G.': 'జి.', 'H.': 'హెచ్.', 'I.': 'ఐ.', 'J.': 'జె.', 'K.': 'కె.', 'L.': 'ఎల్.',
  'M.': 'ఎం.', 'N.': 'ఎన్.', 'O.': 'ఒ.', 'P.': 'పి.', 'Q.': 'క్యూ.', 'R.': 'ఆర్.',
  'S.': 'ఎస్.', 'T.': 'టి.', 'U.': 'యు.', 'V.': 'వి.', 'W.': 'డబ్ల్యూ.', 'X.': 'ఎక్స్.',
  'Y.': 'వై.', 'Z.': 'జెడ్.', 'Ch.': 'సిహెచ్.',
  'Dr.': 'డాక్టర్', 'Dr': 'డాక్టర్', 'Doctor': 'డాక్టర్',
  'Mr.': 'శ్రీ', 'Mr': 'శ్రీ', 'Mrs.': 'శ్రీమతి', 'Mrs': 'శ్రీమతి', 'Ms.': 'కుమారి', 'Ms': 'కుమారి'
};

const COMMON_NAMES: Record<string, string> = {
  'ramesh': 'రమేష్', 'suresh': 'సురేష్', 'mahesh': 'మహేష్', 'rajesh': 'రాజేష్',
  'naresh': 'నరేష్', 'satish': 'సతీష్', 'kishore': 'కిషోర్', 'srinivas': 'శ్రీనివాస్',
  'srinivasa': 'శ్రీనివాస', 'venkat': 'వెంకట్', 'venkatesh': 'వెంకటేష్', 'radhika': 'రాధిక',
  'madhavi': 'మాధవి', 'lakshmi': 'లక్ష్మి', 'sita': 'సీత', 'seetha': 'సీత', 'anitha': 'అనిత',
  'anita': 'అనిత', 'swathi': 'స్వాతి', 'swapna': 'స్వప్న', 'bhavani': 'భవాని', 'kalyani': 'కళ్యాణి',
  'pavan': 'పవన్', 'kalyan': 'కళ్యాణ్', 'chandra': 'చంద్ర', 'sekhar': 'శేఖర్', 'shekar': 'శేఖర్',
  'mohan': 'మోహన్', 'murthy': 'మూర్తి', 'murthi': 'మూర్తి', 'varun': 'వరుణ్', 'tarun': 'తరుణ్',
  'kiran': 'కిరణ్', 'anand': 'ఆనంద్', 'siva': 'శివ', 'shiva': 'శివ', 'sai': 'సాయి',
  'teja': 'తేజ', 'mani': 'మణి', 'ganesh': 'గణేష్', 'subba': 'సుబ్బ', 'ganga': 'గంగ',
  'veera': 'వీర', 'vijay': 'విజయ్', 'ajay': 'అజయ్', 'arun': 'అరుణ్', 'babu': 'బాబు',
  'kumar': 'కుమార్', 'kumari': 'కుమారి', 'reddy': 'రెడ్డి', 'rao': 'రావు', 'naidu': 'నాయుడు',
  'varma': 'వర్మ', 'raju': 'రాజు', 'prasad': 'ప్రసాద్', 'sharma': 'శర్మ', 'devi': 'దేవి',
  'choudhary': 'చౌదరి', 'chowdary': 'చౌదరి', 'patnaik': 'పట్నాయక్', 'singh': 'సింగ్',
  'gupta': 'గుప్తా', 'swamy': 'స్వామి', 'acharya': 'ఆచార్య', 'chary': 'చారి',
  'narayana': 'నారాయణ', 'apparao': 'అప్పారావు', 'pullarao': 'పుల్లారావు', 'veerraju': 'వీర్రాజు',
  'durgarao': 'దుర్గారావు', 'satyanarayana': 'సత్యనారాయణ', 'harish': 'హరీష్', 'naveen': 'నవీన్',
  'pooja': 'పూజ', 'sandhya': 'సంధ్య', 'anuradha': 'అనురాధ', 'raviteja': 'రవితేజ',
  'subrahmanyam': 'సుబ్రహ్మణ్యం', 'bhanu': 'భాను', 'prashanth': 'ప్రశాంత్', 'praveen': 'ప్రవీణ్',
  'sudheer': 'సుధీర్', 'sridhar': 'శ్రీధర్', 'raghav': 'రాఘవ్', 'raghava': 'రాఘవ',
  'krishna': 'కృష్ణ', 'ram': 'రామ్', 'rama': 'రామ', 'gopi': 'గోపి', 'murali': 'మురళి',
  'balaji': 'బాలాజీ', 'deepak': 'దీపక్', 'rahul': 'రాహుల్', 'rohit': 'రోహిత్',
  'sunil': 'సునీల్', 'anil': 'అనిల్', 'vikram': 'విక్రమ్', 'karthik': 'కార్తీక్',
  'manoj': 'మనోజ్', 'vijaya': 'విజయ', 'sarada': 'శారద', 'geetha': 'గీత',
  'sunitha': 'సునీత', 'rekha': 'రేఖ', 'lavanya': 'లావణ్య', 'uma': 'ఉమ',
  'usha': 'ఉష', 'padma': 'పద్మ', 'sailaja': 'శైలజ', 'jyothi': 'జ్యోతి',
  'padmavathi': 'పద్మావతి', 'latha': 'లత', 'hema': 'హేమ', 'srinu': 'శ్రీను',
  'shankar': 'శంకర్', 'sankar': 'శంకర్', 'ramu': 'రాము', 'somu': 'సోము',
  'john': 'జాన్', 'peter': 'పీటర్', 'mary': 'మేరీ', 'joseph': 'జోసెఫ్',
  'ali': 'అలీ', 'ahmed': 'అహ్మద్', 'khan': 'ఖాన్', 'mohammed': 'మహమ్మద్',
  'nani': 'నాని', 'chitti': 'చిట్టి', 'chinna': 'చిన్న', 'pedda': 'పెద్ద'
};

const COMMON_SUFFIXES: [string, string][] = [
  ['babu', 'బాబు'],
  ['rao', 'రావు'],
  ['reddy', 'రెడ్డి'],
  ['naidu', 'నాయుడు'],
  ['varma', 'వర్మ'],
  ['raju', 'రాజు'],
  ['prasad', 'ప్రసాద్'],
  ['kumar', 'కుమార్'],
  ['kumari', 'కుమారి'],
  ['devi', 'దేవి'],
  ['teja', 'తేజ'],
  ['mani', 'మణి'],
  ['swamy', 'స్వామి'],
  ['sharma', 'శర్మ'],
  ['chandra', 'చంద్ర'],
  ['sekhar', 'శేఖర్']
];

const VOWEL_START: Record<string, string> = {
  'aa': 'ఆ', 'a': 'అ', 'ee': 'ఈ', 'i': 'ఇ', 'oo': 'ఊ', 'u': 'ఉ',
  'ae': 'ఏ', 'ai': 'ఐ', 'e': 'ఎ', 'ou': 'ఔ', 'au': 'ఔ', 'oa': 'ఓ', 'o': 'ఒ'
};

const VOWEL_MATRA: Record<string, string> = {
  'aa': 'ా', 'a': '', 'ee': 'ీ', 'i': 'ి', 'oo': 'ూ', 'u': 'ు',
  'ae': 'ే', 'ai': 'ై', 'e': 'ె', 'ou': 'ౌ', 'au': 'ౌ', 'oa': 'ో', 'o': 'ొ'
};

const CONSONANTS: [string, string][] = [
  ['ksh', 'క్ష్'], ['shh', 'ష్'], ['chh', 'ఛ్'], ['jh', 'ఝ్'], ['kh', 'ఖ్'],
  ['gh', 'ఘ్'], ['ch', 'చ్'], ['th', 'త్'], ['dh', 'ధ్'], ['ph', 'ఫ్'],
  ['bh', 'భ్'], ['sh', 'ష్'], ['tr', 'త్ర్'], ['gn', 'జ్ఞ్'], ['k', 'క్'],
  ['g', 'గ్'], ['j', 'జ్'], ['t', 'ట్'], ['d', 'డ్'], ['n', 'న్'],
  ['p', 'ప్'], ['f', 'ఫ్'], ['b', 'బ్'], ['m', 'మ్'], ['y', 'య్'],
  ['r', 'ర్'], ['l', 'ల్'], ['v', 'వ్'], ['w', 'వ్'], ['s', 'స్'],
  ['h', 'హ్']
];

function phoneticWordToTelugu(rawWord: string): string {
  const word = rawWord.toLowerCase();
  if (COMMON_NAMES[word]) return COMMON_NAMES[word];

  // Check common suffixes (e.g. Sitadevi, RameshBabu, Raviteja)
  for (const [suffix, telSuffix] of COMMON_SUFFIXES) {
    if (word.endsWith(suffix) && word.length > suffix.length) {
      const stem = word.slice(0, -suffix.length);
      const telStem = COMMON_NAMES[stem] || phoneticWordToTelugu(stem);
      return `${telStem} ${telSuffix}`;
    }
  }

  let i = 0;
  let result = '';

  while (i < word.length) {
    if (i === 0) {
      let matchedVowel = false;
      for (const [vk, tel] of Object.entries(VOWEL_START)) {
        if (word.startsWith(vk, i)) {
          result += tel;
          i += vk.length;
          matchedVowel = true;
          break;
        }
      }
      if (matchedVowel) continue;
    }

    let matchedConsonant = false;
    for (const [ck, ctel] of CONSONANTS) {
      if (word.startsWith(ck, i)) {
        i += ck.length;
        matchedConsonant = true;

        let matchedMatra = false;
        for (const [vk, matra] of Object.entries(VOWEL_MATRA)) {
          if (word.startsWith(vk, i)) {
            const baseC = ctel.replace(/్$/, '');
            result += baseC + matra;
            i += vk.length;
            matchedMatra = true;
            break;
          }
        }

        if (!matchedMatra) {
          result += ctel;
        }
        break;
      }
    }

    if (!matchedConsonant) {
      let matchedVowel = false;
      for (const [vk, matra] of Object.entries(VOWEL_MATRA)) {
        if (word.startsWith(vk, i)) {
          result += matra;
          i += vk.length;
          matchedVowel = true;
          break;
        }
      }
      if (!matchedVowel) {
        result += word[i];
        i++;
      }
    }
  }

  return result;
}

/**
 * Phonetically transliterates any personal name (patients, doctors, officials) into Telugu script.
 * If already in Telugu script, preserves it untouched.
 */
export function transliterateNameToTelugu(name?: string): string {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  if (!trimmed) return '';

  // If already contains Telugu characters, return as is
  if (/[\u0C00-\u0C7F]/.test(trimmed)) {
    return trimmed;
  }

  const tokens = trimmed.split(/(\s+)/);
  return tokens.map(token => {
    if (/^\s+$/.test(token)) return token;

    if (INITIAL_MAP[token]) {
      return INITIAL_MAP[token];
    }
    const cleanToken = token.replace(/^[.,;:?!]+|[.,;:?!]+$/g, '');
    const punctSuffix = token.slice(cleanToken.length);

    if (INITIAL_MAP[cleanToken + '.']) {
      return INITIAL_MAP[cleanToken + '.'] + punctSuffix;
    }
    if (INITIAL_MAP[cleanToken]) {
      return INITIAL_MAP[cleanToken] + punctSuffix;
    }

    const telugu = phoneticWordToTelugu(cleanToken);
    return telugu + punctSuffix;
  }).join('');
}
