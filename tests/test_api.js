const req = fetch('http://localhost:3000/api/match-jobs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ resumeText: 'Frontend developer with React, Next.js, and CSS experience.' })
}).then(r => r.json()).then(console.log).catch(console.error);
