function startMission(missionId) {
  sessionStorage.setItem('selectedMission', missionId);
  console.log(missionId);

  setTimeout(() => {
    window.location.href = 'mission.html';
  }, 100);
}
