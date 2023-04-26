function calculateResult(choice1, choice2) {
    if (choice1 === choice2) {
      return 'draw';
    }
  
    if (
      (choice1 === 'rock' && choice2 === 'scissors') ||
      (choice1 === 'scissors' && choice2 === 'paper') ||
      (choice1 === 'paper' && choice2 === 'rock')
    ) {
      return 'player1';
    } else {
      return 'player2';
    }
  }
  
  module.exports = {
    calculateResult,
  };