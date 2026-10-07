(() => {
  const players = Array.from(document.querySelectorAll('.early-flex-audio'));
  let position = 0;
  players.forEach(player => {
    player.addEventListener('timeupdate', () => { if (!player.paused) position = player.currentTime; });
    player.addEventListener('seeked', () => { position = player.currentTime; });
    player.addEventListener('play', () => {
      const other = players.find(candidate => candidate !== player && !candidate.paused);
      if (other) position = other.currentTime;
      if (Math.abs(player.currentTime - position) > 0.5) player.currentTime = position;
      document.querySelectorAll('audio, video').forEach(media => { if (media !== player) media.pause(); });
    });
    player.addEventListener('ended', () => { position = 0; });
  });
  document.querySelectorAll('audio, video').forEach(media => {
    if (!players.includes(media)) media.addEventListener('play', () => players.forEach(player => player.pause()));
  });
})();
