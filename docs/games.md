# Games and weekly rankings

The portal uses `/api/games/*` as an authenticated, uncached proxy to the backend's shared games router. Deploy both `quiztaker-bjot` and `bjot-backend` for this feature. No database migration is required: sessions, used questions, and answer history use the existing PostgreSQL tables.

## Rules

- Time Attack: 120 seconds from server-side creation; 10 points per correct answer, 0 for a wrong answer. Timer expiry or exhausting the subject's questions finishes the round.
- Sudden Death: 10 points per correct answer; the first wrong answer ends the round. Exhausting the questions also finishes the round.
- Scholar's Wager: starts at 100 points. Wager an integer from 1 to the current balance. Correct answers add the wager; incorrect answers subtract it. Reaching 1,000 points wins; reaching zero loses; exhausting the questions finishes the round.
- Only active subjects with unarchived multiple-choice questions are offered. Questions are served one at a time, ordered by their configured order and ID, and are not repeated within a round.
- Starting a game resumes the player's active round for that game, even if a different subject was selected. History can also resume a round.
- Quitting ends a round without a ranked score. A completed round must have at least one answered question to qualify.

## Weekly leaderboard

Weeks run Monday 00:00 through the following Monday 00:00 in `Africa/Lagos` (UTC+1), with the end excluded. A round belongs to the week when it finishes. Time Attack finishes at its original deadline even if the browser is closed; leaderboard and history reads finalize expired timed rounds.

Each player has one best score per game per week. The overall score is the sum of those three best scores. Equal scores are ordered by the earliest achievement time, then player ID for stable results. For the overall score, achievement time is the latest of the contributing best rounds. Active and quit sessions, empty rounds, and inactive accounts are excluded. Each tab returns up to 25 players by default (API maximum 100). Changing weeks is a date filter; historical scores are retained.

The server derives identity from the authenticated token, checks session ownership, validates wagers and selected answers, and computes scores. PostgreSQL row locks serialize session updates to prevent duplicate scoring. Browser scores and clocks are never accepted as authoritative.

## Verification

Backend: `node --test test/*.test.js`.

Frontend: `npx tsc --noEmit`, targeted ESLint, and `npm run build`.

For a manual check, sign in, play each game, complete a round, and inspect its game tab and overall ranking. Check a replay with a lower score, a quit round, timer expiry, a page refresh, and the shared game history.

## Leaderboard presentation

The student leaderboard includes a top-three podium, the authenticated student's standing, name search, department filters, and ten-row pagination over the top 100 returned contenders. The backend returns the student's actual rank and total contender counts before applying the display limit, so a student outside the top 100 still sees their standing.

Individual game rows show correct answers (the streak for Sudden Death), accuracy, and average elapsed seconds per answered question from the contributing best round. Overall rows show the three game scores that form the total. Missing historical timing data is shown as unavailable. No cash prizes, XP rewards, school details, or additional games are implied by the design.
