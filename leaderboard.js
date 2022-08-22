async function updateLeaderboard() {
  const leaderboardBody = document.querySelector('#leaderboardBody');
  const response = await fetch('/scores');
  const scores = await response.json();
  let rank = 1;
  leaderboardBody.innerHTML = '';
  scores.forEach((record) => {
    const row = document.createElement('tr');

    const rankCell = document.createElement('td');
    rankCell.innerText = rank++;

    const nameCell = document.createElement('td');
    nameCell.innerText = record[0];

    const scoreCell = document.createElement('td');
    scoreCell.innerText = record[1];

    row.append(rankCell, nameCell, scoreCell);

    leaderboardBody.append(row);
  });
}

updateLeaderboard();
