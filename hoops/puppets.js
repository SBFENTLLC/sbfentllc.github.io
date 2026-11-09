'use strict';

(() => {
  const color = (value,fallback) => /^#[a-f0-9]{6}$/i.test(value) ? value : fallback;
  const signatureLooks = {
    'FLEX A LOT':{art:'flex', crop:'79% 51%', hat:'beanie', hatColor:'#17151b',
      top:'#ece2d5', shorts:'#242637', trim:'#e6c473', ink:'#2d2330', tag:'FLEX', mask:true, metal:1, sleeves:true,
      skin:'#a95d30', hair:'#1b181d', hairStyle:'locs'},
    'DJ BLACKOUT':{art:'dj-blackout', crop:'50% 27%', hat:'cap', hatColor:'#204791',
      top:'#203a76', shorts:'#202842', trim:'#d9a64c', ink:'#ffe5ae', tag:'DJ OFF', headphones:true, metal:0, sleeves:true,
      skin:'#bc7944', hair:'#28202d', hairStyle:'fade'},
    'QUIET MONEY':{art:'quiet-money', crop:'50% 24%', hat:'cap', hatColor:'#c58f2d',
      top:'#204239', shorts:'#172e2b', trim:'#d5a64e', ink:'#ffe5a7', tag:'HUSH', shades:true, metal:0, sleeves:true,
      skin:'#955834', hair:'#32232a', hairStyle:'fade'},
    'THE BOOTLEGGER':{art:'bootlegger', crop:'50% 25%', hat:'tilt', hatColor:'#c24f20',
      top:'#553276', shorts:'#27222d', trim:'#dda646', ink:'#ffe0a0', tag:'COPY', metal:0, sleeves:true,
      skin:'#b77748', hair:'#32232b', hairStyle:'fade'},
    'GOLDIE':{art:'goldie', crop:'35% 31%', hat:'beanie', hatColor:'#1e181b',
      top:'#29232b', shorts:'#2b242c', trim:'#e1b84f', ink:'#ffe296', tag:'SBFENT', hoops:true, metal:1,
      skin:'#b46a38', hair:'#e6b95c', hairStyle:'long-curls'}
  };
  const metals = [
    {shadow:'#704821',body:'#e4b655',shine:'#fff1af'},
    {shadow:'#55546e',body:'#d6dcec',shine:'#fff9ef'},
    {shadow:'#824e47',body:'#e3a88b',shine:'#ffe1c0'}
  ];

  function look(name) {
    return signatureLooks[name==='FLEX'?'FLEX A LOT':name];
  }

  function jewelry(profile, signature) {
    const number=Number(profile?.number)||1;
    return {...metals[signature?.metal??number%metals.length], pendant:number%3, double:!!signature||number%4===0};
  }

  function card(profile) {
    const signature=look(profile.name);
    return signature ?
      `<img class="signaturePortrait" data-look="${signature.art}" src="art/${signature.art}.webp" style="object-position:${signature.crop}" alt="" loading="lazy" decoding="async">` :
      portrait(profile);
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
    const skin = color(profile.skin,'#b98159');
    const hair = color(profile.hair,'#242232');
    const jersey = color(profile.color,'#d9ff75');
    const trim = color(profile.trim,'#233444');
    const number = /^\d{1,2}$/.test(profile.number) ? profile.number : '01';
    const face = faces[profile.face] || faces[0];
    const hairShape = haircuts[profile.hairStyle] || haircuts.fade;
    const accessory = profile.accessory;
    const metal=jewelry(profile);
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
    return `<svg viewBox="0 0 100 118" aria-hidden="true" focusable="false">
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
      <rect x="1" y="1" width="98" height="116" rx="15" fill="#23203a" stroke="${jersey}" stroke-opacity=".55"/>
      <path d="M7 94L94 13M7 108L94 27M15 115L94 43" stroke="${jersey}" stroke-opacity=".10"/>
      <path d="M13 117L16 99Q20 89 40 86L62 86Q81 88 86 100L88 117Z" fill="${jersey}" stroke="${trim}" stroke-width="3"/>
      <path d="M24 117L27 98M76 117L73 98M37 88Q50 109 64 88" fill="none" stroke="${trim}" stroke-width="2.5" stroke-dasharray="3 2"/>
      <path d="M42 76H59V92Q51 99 42 92Z" fill="${skin}" stroke="#3e2935" stroke-width="2"/>
      ${crest}
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
      <path d="${hairShape}" fill="${hair}" stroke="#2a2030" stroke-width="2"/>
      <path d="${hairShape}" fill="url(#${id}fiber)"/>
      <path d="M30 26Q44 16 60 19" fill="none" stroke="#fff4e2" stroke-opacity=".27" stroke-dasharray="2 3" stroke-width="2"/>
      ${gear[accessory]||''}
      <path d="${necklace}" stroke="${metal.shadow}" stroke-width="4.6" fill="none"/>
      <path d="${necklace}" stroke="${metal.body}" stroke-width="3.4" stroke-dasharray="3.1 1" fill="none"/>
      <path d="${necklace}" stroke="${metal.shine}" stroke-width="1.1" stroke-dasharray="1.6 2.5" fill="none"/>
      <path d="${charm}" fill="${metal.body}" stroke="${metal.shine}" stroke-width="1"/>
      <text x="76" y="113" text-anchor="middle" fill="${trim}" font-family="system-ui,sans-serif" font-size="13" font-weight="900">${number}</text>
    </svg>`;
  }

  window.HoopsPuppets = {portrait,card,look,jewelry};
})();
