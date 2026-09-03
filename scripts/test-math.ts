const usable = [
  {
    evaluation: {
      score: 7.5,
    },
  },
  {
    evaluation: {
      score: 8.0,
    },
  },
];

const overall = usable.length
  ? Math.round((usable.reduce((sum, r) => sum + r.evaluation.score, 0) / usable.length) * 10)
  : 0;

console.log("Overall:", overall);
