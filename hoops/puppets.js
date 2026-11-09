'use strict';

(() => {
  const color = (value,fallback) => /^#[a-f0-9]{6}$/i.test(value) ? value : fallback;
  const signatureLooks = {
    'FLEX A LOT':{hat:'beanie', hatColor:'#17151b',
      trim:'#e6c473', tag:'FLEX', mask:true, metal:1, 
      skin:'#a95d30', hair:'#1b181d', hairStyle:'locs'},
    'DJ BLACKOUT':{hat:'cap', hatColor:'#204791',
      trim:'#d9a64c', tag:'DJ OFF', headphones:true, metal:0, 
      skin:'#bc7944', hair:'#28202d', hairStyle:'fade'},
    'QUIET MONEY':{hat:'cap', hatColor:'#c58f2d',
      trim:'#d5a64e', tag:'HUSH', shades:true, metal:0, 
      skin:'#955834', hair:'#32232a', hairStyle:'fade'},
    'THE BOOTLEGGER':{hat:'tilt', hatColor:'#c24f20',
      trim:'#dda646', tag:'COPY', metal:0, 
      skin:'#b77748', hair:'#32232b', hairStyle:'fade'},
    'GOLDIE':{hat:'beanie', hatColor:'#1e181b',
      trim:'#e1b84f', tag:'SBFENT', hoops:true, metal:1,
      skin:'#b46a38', hair:'#e6b95c', hairStyle:'long-curls'}
  };
  // Returning outfits keep the hair, headwear and palette of the existing SBFENT cast.
  const returningLooks = {
    'LITTLE JUICE':{trim:'#41b9f2',skin:'#9b542f',hair:'#171926',hairStyle:'locs',tips:'#47b9ef',metal:1},
    'DETECTIVE FLEX':{trim:'#d9b979',skin:'#a96744',hair:'#2a2224',hairStyle:'fade',hat:'cap',hatColor:'#242832',tag:'CASE',shades:true,metal:0},
    'CLARA':{trim:'#f8b681',skin:'#ae6744',hair:'#8f302d',hairStyle:'long-curls',hoops:true,metal:0},
    'FOXY':{trim:'#f6bd6c',skin:'#aa6743',hair:'#a34343',hairStyle:'long-curls',hoops:true,metal:0},
    'ONYX':{trim:'#ad92d7',skin:'#7c4a34',hair:'#201b24',hairStyle:'long-curls',hoops:true,metal:0},
    'NEON NOVA':{trim:'#c5f45f',skin:'#7e4a36',hair:'#20202a',hairStyle:'locs',tips:'#c4ee61',metal:1,hoops:true},
    'BIG STAMP':{trim:'#d2ac6f',skin:'#73442f',hair:'#211b22',hairStyle:'high',beard:true,metal:0,sleeves:true},
    'VIOLET V':{trim:'#d48ce7',skin:'#a7644c',hair:'#783d9b',hairStyle:'braids',buns:true,hoops:true,metal:1},
    'REDLINE':{trim:'#ff8e65',skin:'#94583b',hair:'#251e24',hairStyle:'locs',tips:'#db4845',beard:true,metal:0},
    'BIG PRESSURE':{trim:'#edc36f',skin:'#774933',hair:'#201b22',hairStyle:'bald',beard:true,metal:0,sleeves:true},
    'LADY STATIC':{trim:'#65d7ef',skin:'#80503b',hair:'#5bbfd6',hairStyle:'swept',hoops:true,metal:1},
    'IRON HAUL':{trim:'#bbd769',skin:'#6e483a',hair:'#666173',hairStyle:'locs',beard:true,metal:1,sleeves:true},
    'THE FALSE KING':{trim:'#e2b956',skin:'#764737',hair:'#533066',hairStyle:'locs',hat:'crown',hatColor:'#d7a849',tag:'KING',shades:true,beard:true,metal:0,sleeves:true}
  };
  const metals = [
    {shadow:'#704821',body:'#e4b655',shine:'#fff1af'},
    {shadow:'#55546e',body:'#d6dcec',shine:'#fff9ef'},
    {shadow:'#824e47',body:'#e3a88b',shine:'#ffe1c0'}
  ];

  function look(name) {
    const key=name==='FLEX'?'FLEX A LOT':name==='LIL JUICE'?'LITTLE JUICE':name;
    return signatureLooks[key]||returningLooks[key];
  }

  function jewelry(profile, signature) {
    const number=Number(profile?.number)||1;
    return {...metals[signature?.metal??number%metals.length], pendant:number%3, double:!!signature||number%4===0};
  }

  let portraitCount=0;
  const faces = [
    'M26 30Q50 18 74 30L78 57Q75 79 51 83Q26 81 22 61Z',
    'M25 35Q31 19 50 21Q72 19 76 36L75 59Q70 84 49 86Q28 82 24 60Z',
    'M22 34Q47 19 78 33L79 59Q77 83 50 85Q22 83 21 58Z',
    'M25 32Q47 18 76 31L78 52Q75 73 51 85Q24 78 23 55Z'
  ];
  const haircuts = {
    fade:'M23 40Q22 24 34 20Q59 13 74 26L77 43L70 34Q53 26 29 39Z',
    curls:'M22 41Q16 36 22 29Q19 22 29 20Q27 11 39 13Q47 5 54 13Q64 7 70 17Q81 16 80 26Q88 30 77 43L70 35Q65 38 60 29Q52 38 45 30Q38 39 32 34Z',
    locs:'M22 53Q16 39 24 27Q21 19 30 18Q33 11 43 15Q53 7 65 14Q83 13 80 35L84 62L78 69L73 47L70 58L64 32L60 41L55 29L51 38L44 29L40 45L34 37L32 59L25 63Z',
    high:'M22 43L20 23Q20 15 30 12L59 7Q78 7 80 18L78 45L68 35L29 37Z',
    braids:'M21 52Q18 26 31 19Q52 7 74 23Q83 32 82 58L76 70L69 64L70 42Q55 25 33 40L34 57L28 69L21 66Z'
  };

  function portrait(profile) {
    const signature=profile.myPlayer?null:look(profile.name);
    const skin = color(signature?.skin||profile.skin,'#b98159');
    const hair = color(signature?.hair||profile.hair,'#242232');
    const jersey = color(profile.color,'#d9ff75');
    const trim = color(profile.trim,'#233444');
    const number = /^\d{1,2}$/.test(profile.number) ? profile.number : '01';
    const face = faces[profile.face] || faces[0];
    const hairStyle=signature?.hairStyle||profile.hairStyle;
    const hairShape = haircuts[hairStyle] || haircuts.fade;
    const accessory = signature ? null : profile.accessory;
    const metal=jewelry(profile,signature);
    const team=/^[A-Z0-9]{2,5}$/.test(profile.teamTag) ? profile.teamTag : 'HOOPS';
    const hatColor=color(signature?.hatColor,'#211b24');
    const id='felt'+(++portraitCount);
    const necklace='M28 93Q35 102 50 105Q65 102 72 93';
    const charm=metal.pendant===0?'M44 104H56V112H44Z':
      metal.pendant===1?'M50 102L56 108L50 114L44 108Z':'M44 104L47 106L50 102L53 106L56 104L55 111H45Z';
    const eyeHeight = profile.eye===1 ? 6 : 8;
    const bigEye = profile.eye===2 ? 9 : eyeHeight;
    const crest = profile.creature==='horns' || accessory==='horn'
      ? '<path d="M30 34Q16 31 14 10Q22 23 37 22M68 31Q82 26 87 11Q90 32 76 40" fill="#f2d5a5" stroke="#472d36" stroke-width="3"/>'
      : profile.creature==='crest' ? `<path d="M33 32L27 12L42 20L52 5L63 21L76 14L73 35Z" fill="${jersey}" stroke="${trim}" stroke-width="3"/>` : '';
    const gear = {
      band:`<path d="M22 37Q49 23 78 36L78 44Q49 31 22 45Z" fill="${jersey}" stroke="${trim}" stroke-width="2"/>`,
      wrap:`<path d="M22 39Q49 27 78 36L79 46Q45 34 21 49Z" fill="${trim}"/><path d="M28 40Q47 33 72 39" fill="none" stroke="${jersey}" stroke-width="2" stroke-dasharray="3 2"/>`,
      hood:`<path d="M24 62Q15 49 20 30Q27 16 49 15Q75 17 81 30Q86 47 78 64L72 42Q63 28 50 28Q34 29 28 43Z" fill="${trim}" stroke="${jersey}" stroke-width="2"/>`,
      crown:`<path d="M27 32L23 14L38 22L51 10L62 23L77 15L72 33Z" fill="#ffd184" stroke="${trim}" stroke-width="2"/><circle cx="51" cy="24" r="3" fill="${jersey}"/>`,
      headset:`<path d="M23 51V38Q23 18 51 18Q78 18 78 38V51" fill="none" stroke="${jersey}" stroke-width="4"/><rect x="18" y="43" width="10" height="18" rx="4" fill="${trim}"/><rect x="73" y="43" width="10" height="18" rx="4" fill="${trim}"/>`,
      visor:`<path d="M28 42Q51 39 75 42L71 54Q53 58 30 53Z" fill="${trim}" stroke="${jersey}" stroke-width="2"/><path d="M35 45L51 44" stroke="#eefbff" stroke-width="2"/>`,
      shades:`<path d="M26 42H74M48 47H54" stroke="${trim}" stroke-width="4"/><rect x="28" y="40" width="21" height="14" rx="5" fill="${trim}" stroke="#f3e7c6"/><rect x="53" y="40" width="21" height="14" rx="5" fill="${trim}" stroke="#f3e7c6"/>`,
      mono:`<circle cx="63" cy="46" r="10" fill="none" stroke="#ffd184" stroke-width="2.5"/><path d="M73 48L74 65" stroke="#ffd184" stroke-width="2"/>`,
      patch:`<path d="M${profile.patchSide===1?65:33} 58v12m-6-6h12" stroke="${jersey}" stroke-width="3" stroke-dasharray="2 1"/>`,
      ribbon:`<path d="M68 27L83 12L85 28L92 32L76 37Z" fill="${jersey}" stroke="${trim}" stroke-width="2"/>`,
      gold:'<circle cx="24" cy="62" r="4" fill="#ffd184"/><circle cx="77" cy="62" r="4" fill="#ffd184"/>',
      bones:'<path d="M26 60l10 8m-9 2l8-11M65 68l9-10m-7 1l8 9" stroke="#f3e9d4" stroke-width="2.3"/>',
      brows:'<path d="M31 35l13 5m24-5l-13 5" stroke="#2d2332" stroke-width="3" stroke-linecap="round"/>',
      guard:`<path d="M24 57Q50 69 77 57L75 70Q50 90 26 69Z" fill="${trim}" stroke="${jersey}" stroke-width="2" stroke-dasharray="3 2"/>`,
      fang:'<path d="M38 66l5 11l4-9m7 0l5 8l4-10" fill="#ffedcc"/>'
    };
    const faceGear = [
      signature?.mask ? '<path d="M24 54Q50 62 77 53L75 72Q52 86 26 72Z" fill="#211b25" stroke="#453645" stroke-width="2"/>' : '',
      signature?.shades ? '<path d="M27 40L49 43L47 53L30 54ZM73 40L51 43L53 53L70 54Z" fill="#211c2c" stroke="#e8bd66" stroke-width="2"/>' : '',
      signature?.beard ? `<path d="M26 64Q50 87 75 64L72 78Q50 88 28 76Z" fill="${hair}"/>` : '',
      signature?.hoops ? '<circle cx="23" cy="67" r="5" fill="none" stroke="#ecc669" stroke-width="2.8"/><circle cx="77" cy="67" r="5" fill="none" stroke="#ecc669" stroke-width="2.8"/>' : ''
    ].join('');
    const headwear=signature?.hat==='crown'?gear.crown:
      signature?.hat==='beanie'?`<path d="M20 38Q19 14 34 10Q53 1 68 13Q83 19 80 40L77 45Q49 33 23 44Z" fill="${hatColor}" stroke="#080c17" stroke-width="2"/><path d="M25 38Q47 28 76 38" stroke="#a18462" stroke-width="1.8" stroke-dasharray="2 2" opacity=".6"/>`:
      signature?.hat?`<g transform="rotate(${signature.hat==='tilt'?12:0} 50 31)"><path d="M20 38Q22 12 48 11Q76 11 79 35L86 41Q66 46 45 39Z" fill="${hatColor}" stroke="#181523" stroke-width="2.5"/><rect x="36" y="22" width="25" height="11" rx="2" fill="#151320"/><text x="48.5" y="30" text-anchor="middle" fill="#f5dea4" font-family="sans-serif" font-size="7" font-weight="900">${signature.tag}</text></g>`:'';
    const headphones=signature?.headphones?'<path d="M19 48V35Q21 11 50 11Q79 11 81 35V48" fill="none" stroke="#151523" stroke-width="4"/><rect x="15" y="38" width="12" height="21" rx="4" fill="#58abc9" stroke="#212131" stroke-width="2.5"/><rect x="73" y="38" width="12" height="21" rx="4" fill="#58abc9" stroke="#212131" stroke-width="2.5"/>':'';
    const longHair=hairStyle==='long-curls'?`<path d="M33 23Q20 21 17 43T15 72Q13 84 29 91Q35 74 30 64L31 41M65 20Q79 21 82 42T86 74Q90 89 73 91Q64 79 70 66L68 41" fill="${hair}" stroke="#3c2930" stroke-width="2.5"/>`:'';
    return `<svg viewBox="0 0 100 140" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="${id}light" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop stop-color="#ffd08c" stop-opacity=".42"/><stop offset=".51" stop-color="#ffd08c" stop-opacity="0"/>
          <stop offset="1" stop-color="#110d21" stop-opacity=".48"/>
        </linearGradient>
        <pattern id="${id}fiber" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 2l2 1m2-2l1 2m1 3l2-1M1 7l1-2" fill="none" stroke="#fff0d5" stroke-opacity=".29" stroke-width=".55"/>
          <path d="M0 4l2 1m3-2l2-1m-4 6l2-2" fill="none" stroke="#271c2d" stroke-opacity=".4" stroke-width=".54"/>
        </pattern>
      </defs>
      <rect x="1" y="1" width="98" height="138" rx="15" fill="#23203a" stroke="${jersey}" stroke-opacity=".55"/>
      <path d="M7 94L94 13M7 108L94 27M15 115L94 43" stroke="${jersey}" stroke-opacity=".10"/>
      <path d="M14 138L17 100Q24 87 40 86H61Q78 87 85 100L88 138Z" fill="${skin}"/>
      <path d="M20 92L38 85Q50 103 63 85L82 92Q78 108 81 137H20Q25 109 20 92Z" fill="${jersey}" stroke="${trim}" stroke-width="2.7"/>
      <path d="M22 95Q29 112 25 136M80 95Q73 112 76 136" fill="none" stroke="#fff1cc" stroke-opacity=".65" stroke-width="1.2"/>
      <path d="M38 85Q50 103 63 85" fill="none" stroke="${trim}" stroke-width="2.6"/>
      <path d="M42 76H59V92Q51 99 42 92Z" fill="${skin}" stroke="#3e2935" stroke-width="2"/>
      ${crest}
      ${longHair}
      <ellipse cx="23" cy="53" rx="8" ry="12" fill="${skin}" stroke="#48303a" stroke-width="2"/>
      <ellipse cx="77" cy="53" rx="8" ry="12" fill="${skin}" stroke="#48303a" stroke-width="2"/>
      <path d="${face}" fill="${skin}" stroke="#392a39" stroke-width="2.6"/>
      <path d="${face}" fill="url(#${id}light)"/><path d="${face}" fill="url(#${id}fiber)"/>
      <path d="M26 49Q28 34 46 31M28 57Q26 75 46 80M72 36Q78 45 73 58" fill="none" stroke="#ffe7c7" stroke-opacity=".45" stroke-width="1.4" stroke-dasharray="2.2 2.6"/>
      <ellipse cx="39" cy="47" rx="8" ry="${eyeHeight}" fill="#fff1d5" stroke="#3d2b38" stroke-width="1.6"/>
      <ellipse cx="62" cy="47" rx="8" ry="${bigEye}" fill="#fff1d5" stroke="#3d2b38" stroke-width="1.6"/>
      <circle cx="40" cy="48" r="3.4" fill="#231e30"/><circle cx="61" cy="48" r="3.4" fill="#231e30"/>
      <circle cx="41" cy="47" r=".95" fill="#fff"/><circle cx="62" cy="47" r=".95" fill="#fff"/>
      <path d="M33 62Q51 71 68 61Q65 78 51 79Q38 78 33 62Z" fill="#332035" stroke="#56343c" stroke-width="1.4"/>
      <path d="M42 75Q50 69 59 74Q53 79 47 77Z" fill="#e09291"/>
      <ellipse cx="50" cy="57" rx="8.5" ry="6" fill="${skin}" stroke="#5b3841" stroke-width="1.6"/>
      <path d="M44 55q4-4 8-2" fill="none" stroke="#ffebce" stroke-opacity=".46" stroke-width="1.6"/>
      ${hairStyle==='bald'?'':`<path d="${hairShape}" fill="${hair}" stroke="#2a2030" stroke-width="2"/>
      <path d="${hairShape}" fill="url(#${id}fiber)"/>`}
      ${signature?.tips?`<path d="M26 32l-4 9m11-15l-2 10m10-13l-2 9m12-11l2 10m9-10l3 9m7-7l3 10" stroke="${signature.tips}" stroke-width="2.5" stroke-linecap="round"/>`:''}
      <path d="M30 26Q44 16 60 19" fill="none" stroke="#fff4e2" stroke-opacity=".27" stroke-dasharray="2 3" stroke-width="2"/>
      ${gear[accessory]||''}
      ${faceGear}
      ${headwear}
      ${headphones}
      <path d="${necklace}" stroke="${metal.shadow}" stroke-width="4.6" fill="none"/>
      <path d="${necklace}" stroke="${metal.body}" stroke-width="3.4" stroke-dasharray="3.1 1" fill="none"/>
      <path d="${necklace}" stroke="${metal.shine}" stroke-width="1.1" stroke-dasharray="1.6 2.5" fill="none"/>
      <path d="${charm}" fill="${metal.body}" stroke="${metal.shine}" stroke-width="1"/>
      <g text-anchor="middle" fill="${trim}" font-family="system-ui,sans-serif" font-weight="900">
        <text x="50" y="119" font-size="6.8" letter-spacing=".25">SBFENT · ${team}</text>
        <text x="50" y="134" font-size="15">${number}</text>
      </g>
    </svg>`;
  }

  window.HoopsPuppets = {portrait,look,jewelry};
})();
