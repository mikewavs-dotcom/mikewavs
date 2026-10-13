// Pixel sprites as character grids. '.' is transparent; every other char maps to a palette color.
// sprite(name, px) returns an <svg> element scaled so each grid cell is px pixels.
(function () {
  const C = {
    ink: '#060018', mag: '#E90AA7', cyan: '#22C3EC', bone: '#F2EEE4', gold: '#C9A24B',
    goldLt: '#F3D27A', goldDk: '#7E5F1C', steel: '#B9B4C9', steelDk: '#6E6888',
  };

  const SPRITES = {
    coin: {
      pal: { D: C.goldDk, G: C.gold, Y: C.goldLt },
      grid: [
        '..DDDDDD..',
        '.DGGGGGGD.',
        'DGYYGGGGGD',
        'DGYGGDGGGD',
        'DGGGGDGGGD',
        'DGGGGDGGGD',
        'DGGGGDGGGD',
        'DGGGGGGGGD',
        '.DGGGGGGD.',
        '..DDDDDD..',
      ],
    },
    moneybag: {
      pal: { D: C.goldDk, G: C.gold, Y: C.goldLt },
      grid: [
        '.....DDDD.....',
        '......DD......',
        '.....DGGD.....',
        '....DGGGGD....',
        '...DGGGGGGD...',
        '..DGGGYGGGGD..',
        '.DGGGYYYGGGGD.',
        '.DGGGYGGGGGGD.',
        '.DGGGYYYGGGGD.',
        '.DGGGGGYGGGGD.',
        '.DGGGYYYGGGGD.',
        '.DGGGGYGGGGGD.',
        '..DGGGGGGGGD..',
        '...DDDDDDDD...',
      ],
    },
    // label exec: slick hair, shades, cyan suit, magenta tie. Frames: idle, talk, grin.
    exec: {
      pal: { H: '#4a3590', S: '#E8B48A', G: '#0b0420', W: C.bone, m: '#8a3b46', B: C.cyan, M: C.mag },
      grid: [
        '....HHHHHHHH....',
        '...HHHHHHHHHH...',
        '..HHHHHHHHHHHH..',
        '..HSSSSSSSSSSH..',
        '..SSSSSSSSSSSS..',
        '..GWGGGSSGWGGG..',
        '..SGGGSSSSGGGS..',
        '..SSSSSSSSSSSS..',
        '..SSSSmmmmSSSS..',
        '...SSSSSSSSSS...',
        '....SSSSSSSS....',
        '..BBBBWMMWBBBB..',
        '.BBBBBWMMWBBBBB.',
        '.BBBBBBMMBBBBBB.',
        '.BBBBBBMMBBBBBB.',
        '.BBBBBBBBBBBBBB.',
      ],
      frames: {
        talk: { 8: '..SSSSmmmmSSSS..', 9: '...SSSmmmmSSS...' },
        grin: { 5: '..GGGWGSSGGGWG..', 8: '..SSSmWWWWmSSS..', 9: '...SSSmmmmSSS...' },
      },
    },
    tee: {
      pal: { T: C.mag, W: C.bone },
      grid: [
        '.TTTT..TTTT.',
        'TTTTTTTTTTTT',
        'TTTTTTTTTTTT',
        '...TTTTTT...',
        '...TTWWTT...',
        '...TTWWTT...',
        '...TTTTTT...',
        '...TTTTTT...',
      ],
    },
    vinyl: {
      pal: { K: '#3a3355', g: '#8a83a8', M: C.cyan },
      grid: [
        '...KKKK...',
        '.KKKKKKKK.',
        '.KgKKKKKK.',
        'KgKMMMMKKK',
        'KKKMMMMKKK',
        'KKKMMMMKKK',
        'KKKMMMMKgK',
        '.KKKKKKgK.',
        '.KKKKKKKK.',
        '...KKKK...',
      ],
    },
    chain: {
      pal: { C: C.steel },
      grid: [
        '.CCCC.....',
        'C....C....',
        'CCC..CCCCC',
        'CCC..CCCCC',
        'C....C....',
        '.CCCC.....',
      ],
    },
    lock: {
      pal: { L: C.steel, P: C.mag, D: '#5a0640' },
      grid: [
        '...LLLL...',
        '..L....L..',
        '..L....L..',
        '..L....L..',
        '.PPPPPPPP.',
        '.PPPPPPPP.',
        '.PPPDDPPP.',
        '.PPPDDPPP.',
        '.PPPPDPPP.',
        '.PPPPPPPP.',
      ],
    },
    sparkle: {
      pal: { Y: C.goldLt, W: '#ffffff' },
      grid: ['..Y..', '..Y..', 'YYWYY', '..Y..', '..Y..'],
    },
  };

  function gridFor(name, frame) {
    const s = SPRITES[name];
    const g = s.grid.slice();
    if (frame && s.frames && s.frames[frame]) {
      for (const [row, line] of Object.entries(s.frames[frame])) g[+row] = line;
    }
    return g;
  }

  function svgFor(name, px, frame) {
    const s = SPRITES[name];
    const g = gridFor(name, frame);
    const h = g.length, w = g[0].length;
    let rects = '';
    g.forEach((line, y) => {
      for (let x = 0; x < line.length; x++) {
        const col = s.pal[line[x]];
        if (col) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${col}"/>`;
      }
    });
    return `<svg class="sprite" xmlns="http://www.w3.org/2000/svg" width="${w * px}" height="${h * px}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects}</svg>`;
  }

  // An element whose sprite frame can be swapped cheaply during rendering.
  window.sprite = function (name, px, frame) {
    const el = document.createElement('div');
    el.className = 'sp-' + name;
    el.style.lineHeight = 0;
    el._cache = {};
    el.setFrame = (f) => {
      const k = f || 'base';
      if (el._frame === k) return;
      el._frame = k;
      el.innerHTML = el._cache[k] || (el._cache[k] = svgFor(name, px, f));
    };
    el.setFrame(frame);
    return el;
  };
  window.spriteSize = (name, px) => [SPRITES[name].grid[0].length * px, SPRITES[name].grid.length * px];
})();
