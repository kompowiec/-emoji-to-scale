import { useEffect, useState } from 'react';
import { getData } from './getData.js';

const WIDTH = 300;

function lojbanLength(number) {
  return number.toString().replace(/\./g, ' pi ');
}

function parseSize(size) {
  if (size < 2) {
    return `miltre li ${lojbanLength(size * 10)}<br/> (${size * 10} mm)`;
  }
  if (size < 100) {
    return `centre li ${lojbanLength(size)}<br/> (${size}cm)`;
  }
  if (size < 100 * 1000) {
    return `mitre li ${lojbanLength(Math.round(size * 100) / 100 / 100)}<br/> (${
      Math.round(size * 100) / 100 / 100
    }m)`;
  }
  return `ki'otre li ${lojbanLength(Math.round(size / 100 / 10) / 100)}<br/> (${
    Math.round(size / 100 / 10) / 100
  }km)`;
}

function App() {
  const [data, dataSet] = useState([]);
  const [scroll, scrollSet] = useState(0);

  let compoundDistance = window.innerWidth / 2;

  useEffect(() => {
    getData().then((res) => {
      dataSet(res);
      document.body.style.height = `${WIDTH * res.length + window.innerHeight}px`;
    });

    function loop() {
      const newScroll = window.pageYOffset;
      scrollSet(newScroll);
      window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);
  }, []);

  function emojiUnicode(emoji) {
    var comp;
    if (emoji.length === 1) {
      comp = emoji.charCodeAt(0);
    }
    comp = (emoji.charCodeAt(0) - 0xd800) * 0x400 + (emoji.charCodeAt(1) - 0xdc00) + 0x10000;
    if (comp < 0) {
      comp = emoji.charCodeAt(0);
    }
    return comp.toString('16');
  }

  return (
    <div className="emoji-display">
      {data.map(([emoji, size, label]) => {
        const width = window.innerWidth;
        let relativeDistance = compoundDistance - scroll;

        if (relativeDistance < width / 2) {
          relativeDistance =
            relativeDistance * 0.25 + (0.75 * (relativeDistance + width * 0.5)) / 2;
        }

        compoundDistance += WIDTH;

        if (relativeDistance < -WIDTH / 2 || relativeDistance > width - WIDTH / 2) {
          return null;
        }

        let emojisToScale = [Math.floor(scroll / WIDTH), Math.ceil(scroll / WIDTH)];

        emojisToScale = emojisToScale
          .map((idx) => {
            if (idx < 0) return 0;
            if (idx > data.length - 1) return data.length - 1;
            return idx;
          })
          .map((idx) => data[idx]);

        const floorCeilProgress = (scroll / WIDTH) % 1;
        const floatScale =
          floorCeilProgress * emojisToScale[1][1] + (1 - floorCeilProgress) * emojisToScale[0][1];

        const calculatedScale = Math.min(size / floatScale, 64);

        let opacity = 1;
        if (calculatedScale > 3) {
          const diff = (calculatedScale - 3) / 8;
          opacity = Math.max(1 - diff, 0);
        }

        return (
          <div
            className="emoji-container"
            style={{
              transform: `translatex(${relativeDistance}px)`
              // left: `${relativeDistance}px`
            }}
            key={emoji}
          >
            <div
              className="emoji"
              style={{
                opacity,
                transform: `scale(${calculatedScale}) translateY(10%)`
              }}
            >
              <img
                src={`https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/emoji_u${emojiUnicode(
                  emoji
                )}.svg`}
              />
            </div>
            <div style={{ marginTop: '2rem', maxWidth: '15rem' }}>
              <b>{label}</b>
              <div
                dangerouslySetInnerHTML={{ __html: parseSize(size) }}
                style={{ marginTop: '.5rem' }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default App;
