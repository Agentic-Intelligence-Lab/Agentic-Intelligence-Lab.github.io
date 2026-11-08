document.querySelectorAll('#pair-0-agentview').forEach(pair => {
  const videos = [...pair.querySelectorAll('video')];
  const details = pair.closest('details');

  videos.forEach(video => {
    video.muted = true;
    video.defaultPlaybackRate = 2;
    video.playbackRate = 2;
  });

  async function startPair() {
    videos.forEach(video => { video.currentTime = 0; video.playbackRate = 2; });
    const results = await Promise.allSettled(videos.map(video => video.play()));
    if (results.some(result => result.status === 'rejected')) {
      videos.forEach(video => { video.controls = true; });
    }
  }

  videos.forEach(video => video.addEventListener('ended', () => {
    if (videos.every(item => item.ended)) startPair();
  }));

  const ready = Promise.all(videos.map(video => video.readyState >= 2
    ? Promise.resolve()
    : new Promise(resolve => video.addEventListener('loadeddata', resolve, {once: true}))));
  ready.then(() => {
    if (!details || details.open) startPair();
  });
  details?.addEventListener('toggle', () => {
    if (details.open) ready.then(startPair);
    else videos.forEach(video => video.pause());
  });
});
