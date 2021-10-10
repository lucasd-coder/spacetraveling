import { useEffect } from 'react';

const Utterances = (): JSX.Element => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    const anchor = document.getElementById('inject-comments-for-uterances');
    script.async = true;
    script.setAttribute('repo', 'lucasd-coder/spacetraveling');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('label', 'comment :speech_balloon:');
    script.setAttribute('theme', 'photon-dark');
    script.setAttribute('crossorigin', 'anonymous');
    anchor.appendChild(script);
  }, []);

  return <div id="inject-comments-for-uterances" />;
};

export default Utterances;
