import { getLeague, LEAGUES } from '../utils/leagues';

describe('Leagues Logic', () => {
  test('should return Bronze league for 0 XP', () => {
    const league = getLeague(0);
    expect(league.id).toBe('bronze');
  });

  test('should return Bronze league for 299 XP', () => {
    const league = getLeague(299);
    expect(league.id).toBe('bronze');
  });

  test('should promote to Silver league at 300 XP', () => {
    const league = getLeague(300);
    expect(league.id).toBe('silver');
  });

  test('should return Gold league at 800 XP', () => {
    const league = getLeague(800);
    expect(league.id).toBe('gold');
  });

  test('should reach Diamond league at 5000+ XP', () => {
    const league = getLeague(5000);
    expect(league.id).toBe('diamond');
    const ultraLeague = getLeague(10000);
    expect(ultraLeague.id).toBe('diamond');
  });

  test('LEAGUES constant should be correctly defined', () => {
    expect(LEAGUES.length).toBe(5);
    expect(LEAGUES[0].id).toBe('bronze');
    expect(LEAGUES[4].id).toBe('diamond');
  });
});
